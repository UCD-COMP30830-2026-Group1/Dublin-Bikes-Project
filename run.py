from flask_app import create_app
from flask import send_from_directory
import os

app = create_app()

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    static_folder = app.static_folder or "flask_app/static"
    full_path = os.path.join(static_folder, path)

    if path != "" and os.path.exists(full_path):
        return send_from_directory(static_folder, path)

    return send_from_directory(static_folder, "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
