from bokeh.core.properties import Instance
from bokeh.io import output_file, show
from bokeh.core.properties import value
from bokeh.models import ColumnDataSource, EditTool, Drag, Tap, CustomJS
from bokeh.plotting import figure
from bokeh.util.compiler import TypeScript
from forest.barc import text_stamp

#from bokeh.models.tools import FrontDrawTool

class FrontDrawTool(EditTool, Drag, Tap):
    __implementation__ = "front_tool.ts"
    #source = Instance(ColumnDataSource)

