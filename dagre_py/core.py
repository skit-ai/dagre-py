import json
import os
import webbrowser

import pkg_resources


def plot(dagre_data, json_encoder=None, open_browser=True):
    """
    Plot and, optionally, display the dag.
    """

    serve_dir = pkg_resources.resource_filename("dagpy", "js")

    with open(os.path.join(serve_dir, "data.js"), "w", encoding="utf-8") as fp:
        fp.write("let data = {}".format(json.dumps(dagre_data, cls=json_encoder, indent=2)))

    if open_browser:
        webbrowser.open("file://" + os.path.join(serve_dir, "index.html"))
