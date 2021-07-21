## File Structure
- `unisankey.js`: Contains the classes for parts of a UniSankey diagram (nodes and links)
    - There are some constants here that pertain to the sizing of the diagram (how wide things are, etc.)
    - Generally, you shouldn't have to touch this file, but you might want to read the documentation.
- `interactive.js`: Contains handlers for user interactions (e.g. when they hover or click on something).
    - Also controls how different display elements look (filter options, hover text, etc.)
    - You also likely don't have to touch this file.
    - `hidden_sankey.js` also helps with this code. You don't have to touch it.
- `create_sankeys.js`: Contains code for creating sankey diagrams. `initializeEditorSankey`  gives a large example of how the given visualization is setup, how the nodes are made, etc.
    - There's a handful of constant here -- the only one you'll want to change is `KEY_GROUPINGS` and `UNFILTERABLE`
        - `KEY_GROUPINGS` is a collection of boolean nodes that we want to group together (e.g. `male` and `female` are both in the same `gender` group)
        - `UNFILTERABLE` are any nodes we don't want to filter by
- `sankey_override.js`: Has code that creates specific sankey diagrams (with specific filters and visible nodes).
    - Might be useful if you're interested in forcing certain diagrams, but not particularly helpful otherwise.
- `data_filtering.js`: Contains all of the data needed in a somewhat silly form.
    - You'll want to base your code off of this to apply new datasets.
    - It reads in a CSV file (due to how file reading works, the CSV has to be hosted online somewhere. I just use my own repository link.)
        - This is the URL in the `$(document).ready(function() {...}` part.
    - `KEY_TO_COLUMNS` lists the keys (names/IDs) we use internally for each column, and the corresponding column index in the CSV
    - `KEY_TO_DESC` lists the description we want to use for each key
        - There's an OCE version with slightly different descriptions. Ignore that.
    - `NORMALIZATION_MAPPING` gets used in `normalizeData` -- it's for scaling purposes for special values for use with `RESCALE_MAX`.
    - `RESCALE_MAX` lists how much we want to scale the max up/down by (i.e. in the case of outliers, the max might be inflated highly so we shrink it down).

## Creating Sankey Diagrams
Based on the above, to create your own sankey diagrams:
- Modify `data_filtering.js` to match the data you're currently using.
- Read through the `initializeEditorSankey` function in `create_sankeys.js`
    - You'll likely want to read the documentation in `unisankey.js` as well (the code there should be reasonably documented.)
    - As a summary: nodes are created one column at a time, and then the links are drawn in between nodes (`left.createLink(right)` draws a node from the left to the right).
    - There's some data scaling stuff that happens too, which should be self-explanatory.
    - Modify line 179 (`url: "http://wisdi.me/sankey/dataset.csv"`) to point to the CSV you want to use.


## Other notes

- There's probably some bugs in it since I tried to strip things out (and probably removed some necessary dependencies).
    - Feel free to mention them to me, and I'll try to fix it if I have time. If I forget, please feel free to keep poking me about it.
- To do for Sophia: make a version without the tutorial.
