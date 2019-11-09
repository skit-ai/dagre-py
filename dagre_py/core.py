"""
Low level API for dagre-py
"""

import json
import os
import webbrowser
from typing import Dict, List

import pkg_resources


def plot(dagre_data: Dict[str, List[Dict]], json_encoder=None, open_browser=True):
    """
    Plot and, optionally, display the dag. `dagre_data` is a dictionary with
    specifications for `nodes` (a list of node dictionaries) and `edges` (a
    list of edge dictionaries).

    A `node` dictionary looks like the following:

    ```
    {
      # `label` is the text to show on the node (also is the unique identifier,
      #  we might create a separate `id` key for the uniqueness piece)
      "label": "node-name",

      # Rest are optional
      # `description` is the description to be displayed on the side panel.
      "description": "something like a json dump here",

      # `tooltip` is the text to show in tooltip (fallback is description)
      "tooltip": "hello world",

      "attributes": {
        "disabled": True,
        "style": {
          "fill": "white",
          "stroke": "#333"
        }
      }
    }
    ```

    An `edge` dictionary looks like the following:
    ```
    {
      "source": "source-node-label",
      "target": "target-node-label",
      "label": "edge-label",

      # Rest are optional
      "attributes": {
        "disabled": False
      }
    }
    ```

    An optional `attributes` dictionary for attaching to the main graph can
    also be passed:
    ```
    {
      "rankdir": "LR"
    }
    ```
    """

    serve_dir = pkg_resources.resource_filename("dagre_py", "js")

    with open(os.path.join(serve_dir, "data.js"), "w", encoding="utf-8") as fp:
        fp.write("let data = {}".format(json.dumps(dagre_data, cls=json_encoder, indent=2)))

    if open_browser:
        webbrowser.open("file://" + os.path.join(serve_dir, "index.html"))
