import traceback

from flask import Blueprint, jsonify, request

from .service import build_report_pdf, process_submission, report_error


smart_compliance_bp = Blueprint("smart_compliance", __name__)


@smart_compliance_bp.route("/", methods=["GET"])
def smart_compliance_home():
    return jsonify({"status": "Smart Compliance module running"})


@smart_compliance_bp.route("/process", methods=["POST"])
def process_document():
    try:
        uploaded_file = request.files.get("file")
        text_field = request.form.get("text", "")
        return jsonify(process_submission(uploaded_file, text_field))
    except Exception as exc:
        return report_error(str(exc), 400)


@smart_compliance_bp.route("/download-report", methods=["POST"])
def download_report():
    try:
        payload = request.get_json()
        pdf = build_report_pdf(payload)
        return pdf, 200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=compliance_report.pdf",
        }
    except Exception:
        traceback.print_exc()
        return report_error("PDF generation failed")

