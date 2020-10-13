from bokeh.core.properties import Instance
from bokeh.io import output_file, show
from bokeh.core.properties import value
from bokeh.models import ColumnDataSource, EditTool, Drag, Tap, CustomJS
from bokeh.plotting import figure
from bokeh.util.compiler import TypeScript

#from bokeh.models.tools import FrontDrawTool

output_file('tool.html')

class FrontDrawTool(EditTool, Drag, Tap):
    __implementation__ = "draw_tool.ts"
    #source = Instance(ColumnDataSource)

plot = figure(x_range=(0, 10), y_range=(0, 10))

#plot.bezier(x0=6.92, y0=9.31, x1=6.83, y1=2.62, cx0=2.17, cy0=8.21, cx1=1.73, cy1=4.00)
source = ColumnDataSource(data=dict(xs=[], ys=[], x0=[], y0=[], x1=[], y1=[], cx0=[], cy0=[], cx1=[], cy1=[],angle=[]))
#source = ColumnDataSource(data=dict(xs=[None], ys=[None], x0=[None], y0=[None], x1=[None], y1=[None], cx0=[None], cy0=[None], cx1=[None], cy1=[None],angle=[None]))
renderers = [
   plot.bezier(x0='x0', y0='y0', x1='x1', y1='y1', cx0='cx0', cy0='cy0', cx1="cx1", cy1="cy1", source=source, line_color="#d95f02", line_width=2),
   plot.multi_line(xs='xs',ys='ys', color="#aaaaaa", line_width=1, source=source)
]

source.js_on_change('data',
   CustomJS(args=dict(datasource =source), code="""
   """
   ));

plot.add_tools(FrontDrawTool(renderers=renderers))
plot.title.text = "Drag to draw on the plot"

show(plot)
