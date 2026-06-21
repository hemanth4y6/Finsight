import base64
import datetime
import io
import os
import re
import shutil
import tempfile
from functools import lru_cache

import fitz
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import spacy
from flask import jsonify
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Image as RLImage,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


@lru_cache(maxsize=1)
def get_nlp():
    """Load spaCy once and fall back to a blank English model."""
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        return spacy.blank("en")


def extract_text_with_pymupdf(file_path):
    try:
        doc = fitz.open(file_path)
        return "\n".join(page.get_text("text") for page in doc).strip()
    except Exception:
        return ""


def extract_text_from_file(file_path, extension):
    if extension.lower() == "pdf":
        return extract_text_with_pymupdf(file_path)
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file_handle:
            return file_handle.read()
    except Exception:
        return ""


def split_into_clauses(text):
    clauses = []
    buffer = []
    current = None

    for line in text.splitlines():
        match = re.match(r"^(\d+(\.\d+)+)\s+", line.strip())
        if match:
            if current and buffer:
                clauses.append((current, " ".join(buffer)))
            current = match.group(1)
            buffer = [line.strip()]
        elif line.strip():
            buffer.append(line.strip())

    if current and buffer:
        clauses.append((current, " ".join(buffer)))

    return clauses


def analyze_clause(clause_text):
    doc = get_nlp()(clause_text.lower())

    has_obligation = False
    has_condition = False
    has_consequence = False

    for token in doc:
        lemma = token.lemma_ or token.text
        if lemma in ("shall", "must", "liable", "responsible"):
            has_obligation = True
        if lemma in ("may", "subject", "conditional", "provided"):
            has_condition = True
        if lemma in ("penalty", "terminate", "breach", "violate", "damage", "sanction"):
            has_consequence = True

    if has_obligation and has_consequence:
        return {
            "clause": clause_text,
            "risk_level": "High",
            "reason": "Clause imposes legal obligation with enforceable consequences",
        }

    if has_obligation or has_condition:
        return {
            "clause": clause_text,
            "risk_level": "Medium",
            "reason": "Clause introduces obligations or conditional compliance requirements",
        }

    return {
        "clause": clause_text,
        "risk_level": "Low",
        "reason": "Informational or descriptive clause with no enforceable obligation",
    }


def analyze_clauses(clauses):
    results = []
    for clause_number, clause_text in clauses:
        analyzed = analyze_clause(clause_text)
        analyzed["clause_number"] = clause_number
        results.append(analyzed)
    return results


def summarize_text_locally(analysis):
    high = sum(item["risk_level"] == "High" for item in analysis)
    medium = sum(item["risk_level"] == "Medium" for item in analysis)
    low = sum(item["risk_level"] == "Low" for item in analysis)

    return (
        "Automated compliance analysis completed. "
        f"{high} high-risk clauses impose enforceable legal obligations with penalties or liabilities. "
        f"{medium} medium-risk clauses introduce conditional or review-based requirements. "
        f"{low} clauses were informational and pose minimal compliance risk."
    )


def render_pie_base64(risk_list):
    counts = {"High": 0, "Medium": 0, "Low": 0}
    for item in risk_list:
        counts[item["risk_level"]] += 1

    fig, ax = plt.subplots(figsize=(4, 4))
    ax.pie(counts.values(), labels=counts.keys(), autopct="%1.1f%%")
    ax.set_title("Compliance Risk Distribution")

    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight")
    plt.close(fig)

    return base64.b64encode(buffer.getvalue()).decode(), counts


def process_submission(uploaded_file=None, text_field=""):
    tmp_dir = None
    try:
        extracted_text = ""

        if uploaded_file:
            tmp_dir = tempfile.mkdtemp()
            file_path = os.path.join(tmp_dir, uploaded_file.filename)
            uploaded_file.save(file_path)
            extension = uploaded_file.filename.rsplit(".", 1)[-1] if "." in uploaded_file.filename else ""
            extracted_text = extract_text_from_file(file_path, extension)
        else:
            extracted_text = text_field

        if not extracted_text.strip():
            return {"summary": "No text found", "risk_analysis": [], "risk_counts": {}}

        clauses = split_into_clauses(extracted_text)
        if not clauses:
            clauses = [
                (str(index + 1), line)
                for index, line in enumerate(extracted_text.splitlines())
                if line.strip()
            ]

        analyzed = analyze_clauses(clauses)
        chart_b64, counts = render_pie_base64(analyzed)

        return {
            "summary": summarize_text_locally(analyzed),
            "risk_analysis": analyzed,
            "risk_chart_base64": chart_b64,
            "risk_counts": counts,
        }
    finally:
        if tmp_dir and os.path.isdir(tmp_dir):
            shutil.rmtree(tmp_dir)


def build_report_pdf(data):
    tmp_dir = tempfile.mkdtemp()
    try:
        pdf_path = os.path.join(tmp_dir, "compliance_report.pdf")
        doc = SimpleDocTemplate(pdf_path, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph("<b>Compliance Risk Report</b>", styles["Title"]))
        elements.append(
            Paragraph(
                f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                styles["Normal"],
            )
        )
        elements.append(Spacer(1, 12))

        elements.append(Paragraph("<b>Summary</b>", styles["Heading2"]))
        elements.append(Paragraph(data["summary"], styles["Normal"]))
        elements.append(Spacer(1, 12))

        table_data = [["Clause No", "Clause", "Risk", "Reason"]]
        for item in data["risk_analysis"]:
            table_data.append([
                item["clause_number"],
                item["clause"],
                item["risk_level"],
                item["reason"],
            ])

        table = Table(table_data, colWidths=[60, 230, 60, 140], repeatRows=1)
        table.setStyle(
            TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
            ])
        )
        elements.append(table)

        if data.get("risk_chart_base64"):
            chart_path = os.path.join(tmp_dir, "chart.png")
            with open(chart_path, "wb") as chart_file:
                chart_file.write(base64.b64decode(data["risk_chart_base64"]))
            elements.append(Spacer(1, 12))
            elements.append(RLImage(chart_path, width=300, height=300))

        doc.build(elements)
        with open(pdf_path, "rb") as pdf_file:
            return pdf_file.read()
    finally:
        shutil.rmtree(tmp_dir)


def report_error(message, status=500):
    return jsonify({"error": message}), status

