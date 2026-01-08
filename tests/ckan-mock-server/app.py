import logging
import time

from flask import Flask, jsonify, request, g

# Create the Flask app instance.
app = Flask(__name__)
# Configure application-wide logging.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

# CKAN-style groups used as "sector-*" categories with icon keys.
# The image_display_url stores the icon key expected by the front-end.
GROUPS_CATALOG = {
    "sector-mobility": {
        "name": "sector-mobility",
        "title": "Mobility",
        "display_name": "Mobility",
        "description": "Mobility and traffic data.",
        "image_display_url": "truck",
        "id": "group-sector-mobility",
    },
    "sector-energy": {
        "name": "sector-energy",
        "title": "Energy",
        "display_name": "Energy",
        "description": "Energy production and usage data.",
        "image_display_url": "lightning-charge",
        "id": "group-sector-energy",
    },
    "sector-environment": {
        "name": "sector-environment",
        "title": "Environment",
        "display_name": "Environment",
        "description": "Environmental and air quality data.",
        "image_display_url": "tree",
        "id": "group-sector-environment",
    },
    "sector-waste": {
        "name": "sector-waste",
        "title": "Waste",
        "display_name": "Waste",
        "description": "Waste collection and recycling data.",
        "image_display_url": "recycle",
        "id": "group-sector-waste",
    },
    "sector-health": {
        "name": "sector-health",
        "title": "Health",
        "display_name": "Health",
        "description": "Healthcare and wellbeing data.",
        "image_display_url": "heart-pulse",
        "id": "group-sector-health",
    },
    "sector-safety": {
        "name": "sector-safety",
        "title": "Safety",
        "display_name": "Safety",
        "description": "Public safety and security data.",
        "image_display_url": "shield-lock",
        "id": "group-sector-safety",
    },
    "sector-housing": {
        "name": "sector-housing",
        "title": "Housing",
        "display_name": "Housing",
        "description": "Housing and built environment data.",
        "image_display_url": "house-door",
        "id": "group-sector-housing",
    },
    "sector-economy": {
        "name": "sector-economy",
        "title": "Economy",
        "display_name": "Economy",
        "description": "Economic indicators and business data.",
        "image_display_url": "graph-up-arrow",
        "id": "group-sector-economy",
    },
    "sector-culture": {
        "name": "sector-culture",
        "title": "Culture",
        "display_name": "Culture",
        "description": "Culture-related data.",
        "image_display_url": "book-half",
        "id": "group-sector-culture",
    },
    "sector-governance": {
        "name": "sector-governance",
        "title": "Governance",
        "display_name": "Governance",
        "description": "Government and policy data.",
        "image_display_url": "bank",
        "id": "group-sector-governance",
    },
    "sector-debugging": {
        "name": "sector-debugging",
        "title": "Debugging",
        "display_name": "Debugging",
        "description": "Internal testing and debugging data.",
        "image_display_url": "bug-fill",
        "id": "group-sector-debugging",
    },
}


# Static demo datasets returned by the API.
packages = [
    {
        "id": "inzichtverlicht-traffic-flow-data",
        "name": "Traffic Flow Data derived from Video-to-Text Analysis",
        "title": "Traffic Flow Data",
        "notes": "First dataset published by Inzichtverlicht.",
        "author": "Vinotion",
        "category": "Mobility / Traffic",
        "groups": [GROUPS_CATALOG["sector-mobility"]],
        "resources": [
            {
                "id": "resource-1",
                "name": "Traffic Flow Data - CSV",
                "format": "CSV",
                "url": "http://example.com/traffic_flow_data.csv",
            }
        ],
    },
    {
        "id": "inzichtverlicht-fijnstof-monitoring-data",
        "name": "Fijnstof-monitoring-data-1",
        "title": "Fijnstof Monitoring Data",
        "notes": "Second dataset published by Inzichtverlicht.",
        "author": "Municipality of Eindhoven",
        "category": "Particulate matter",
        "groups": [GROUPS_CATALOG["sector-environment"]],
        "resources": [
            {
                "id": "resource-1",
                "name": "Fijnstof Monitoring Data - CSV",
                "format": "CSV",
                "url": "http://example.com/fijnstof_monitoring_data.csv",
            }
        ],
    },
    {
        "id": "inzichtverlicht-sound-levels",
        "name": "Sound levels",
        "title": "Sound levels",
        "notes": "Third dataset published by Inzichtverlicht.",
        "author": "Sorama",
        "category": "Sound",
        "groups": [GROUPS_CATALOG["sector-health"]],
        "resources": [
            {
                "id": "resource-1",
                "name": "Modified_Sorama_SMD 2.csv",
                "format": "CSV",
                "url": "http://example.com/modified_sorama_smd_2.csv",
            }
        ],
    },
    # Modified_Sorama_SMD 2.csv
]

@app.route('/api/3/action/package_list', methods=['GET'])
def package_list():
    # Return only the list of dataset IDs, matching CKAN's package_list behavior.
    app.logger.info("package_list request from=%s", request.remote_addr)
    data = {
        "help": "https://demo.ckan.org/api/3/action/help_show?name=package_list",
        "success": True,
        "result": [
            pkg["id"] for pkg in packages
        ]
    }
    return jsonify(data)

@app.route('/api/3/action/package_show', methods=['GET'])
def package_show():
    # Return the full dataset payload for a given ID.
    id = request.args.get('id')
    if id is None:
        app.logger.warning("package_show missing id from=%s", request.remote_addr)
        return jsonify({"success": False, "error": "Missing 'id' parameter"}), 400
    else:
        package = next((pkg for pkg in packages if pkg["id"] == id), None)
        if package is None:
            app.logger.info(
                "package_show not_found id=%s from=%s",
                id,
                request.remote_addr,
            )
            return jsonify({"success": False, "error": "Package not found"}), 404

        else:
            app.logger.info(
                "package_show ok id=%s from=%s",
                id,
                request.remote_addr,
            )
            return jsonify({
            "success": True,
            "result": package
            })


@app.before_request
def start_timer():
    # Track request duration for logging.
    g.start_time = time.perf_counter()


@app.after_request
def log_request(response):
    # Log method, path, status, and duration for every request.
    duration_ms = (time.perf_counter() - g.start_time) * 1000
    app.logger.info(
        "%s %s status=%s duration_ms=%.2f",
        request.method,
        request.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.route('/dataset/<id>', methods=['GET'])
def dataset_page(id):
    # Minimal HTML landing page for a dataset (CKAN-compatible path).
    package = next((pkg for pkg in packages if pkg["id"] == id), None)
    if package is None:
        app.logger.info("dataset_page not_found id=%s from=%s", id, request.remote_addr)
        return "Dataset not found", 404
    app.logger.info("dataset_page ok id=%s from=%s", id, request.remote_addr)
    resource_items = "".join(
        f"<li>{res['name']} ({res['format']})</li>" for res in package.get("resources", [])
    )
    # Render a simple HTML page without templates for demo purposes.
    html = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>{package['title']}</title>
  </head>
  <body>
    <h1>{package['title']}</h1>
    <p>{package['notes']}</p>
    <p><strong>Author:</strong> {package['author']}</p>
    <p><strong>Category:</strong> {package['category']}</p>
    <h2>Resources</h2>
    <ul>
      {resource_items}
    </ul>
  </body>
</html>
"""
    return html

if __name__ == '__main__':
    # Run the development server.
    app.run(host='0.0.0.0', debug=True)
