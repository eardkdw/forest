import {UIEvent} from "core/ui_events"
import * as p from "core/properties"
import {isArray} from "core/util/types"
import {MultiLine} from "models/glyphs/multi_line"
import {Patches} from "models/glyphs/patches"
import {Bezier} from "models/glyphs/bezier"
//import {Circle} from "models/glyphs/circle"
//import {Text} from "models/glyphs/text"
import {PolyTool} from "models/tools/edit/poly_tool"
import {PolyDrawToolView} from "models/tools/edit/poly_draw_tool"
import {bk_tool_icon_poly_draw} from "styles/icons"
//import {patch_to_column} from "models/sources/column_data_source"

export interface HasPolyGlyph {
  glyph: MultiLine | Patches | Bezier
}

export class FrontDrawToolView extends PolyDrawToolView {
  model: FrontDrawTool
  _draw(ev: UIEvent, mode: string, emit: boolean = false): void {
    const renderer = this.model.renderers[0]
    const bez = this.model.renderers.filter(function(element) { return (element.glyph.tags.indexOf("bezier") > -1); })
    const bez_ds = bez[0].data_source
    const point = this._map_drag(ev.sx, ev.sy, renderer)

    if (!this._initialized)
      this.activate() // Ensure that activate has been called

    if (point == null)
      return

    const [x, y] = this._snap_to_vertex(ev, ...point)

    const cds = renderer.data_source
    const glyph: any = renderer.glyph
    const bez_glyph: any = bez[0].glyph
    const [xkey, ykey] = [glyph.xs.field, glyph.ys.field]
    const [x0key, y0key] = [bez_glyph.x0.field, bez_glyph.y0.field]
    const [cx0key, cy0key] = [bez_glyph.cx0.field, bez_glyph.cy0.field]
    const [cx1key, cy1key] = [bez_glyph.cx1.field, bez_glyph.cy1.field]
    const [x1key, y1key] = [bez_glyph.x1.field, bez_glyph.y1.field]
    if (mode == 'new') {
      this._pop_glyphs(cds, this.model.num_objects)
      if (xkey) cds.get_array(xkey).push([x, x])
      if (ykey) cds.get_array(ykey).push([y, y])
      if (x0key) bez_ds.get_array(x0key).push(null)
      if (y0key) bez_ds.get_array(y0key).push(null)
      if (cx0key) bez_ds.get_array(cx0key).push(null)
      if (cy0key) bez_ds.get_array(cy0key).push(null)
      if (cx1key) bez_ds.get_array(cx1key).push(null)
      if (cy1key) bez_ds.get_array(cy1key).push(null)
      if (x1key) bez_ds.get_array(x1key).push(null)
      if (y1key) bez_ds.get_array(y1key).push(null)
      this._pad_empty_columns(cds, [xkey, ykey])
    } else if (mode == 'edit') {
      if (xkey) {
        const xs = cds.data[xkey][cds.data[xkey].length-1]
        xs[xs.length-1] = x
      }
      if (ykey) {
        const ys = cds.data[ykey][cds.data[ykey].length-1]
        ys[ys.length-1] = y
      }
      /*if(xkey && ykey)
      {
        //Update Beziér curve
        const xidx = cds.data[xkey].length-1
        if(cds.data[xkey][xidx].length > 3)
        {
           if((cds.data[xkey][xidx].length-1) % 3 == 0)
           {
              const xs = cds.data[xkey][cds.data[xkey].length-1]
              const ys = cds.data[ykey][cds.data[ykey].length-1]
              const x0 = bez_ds.data[x0key]
              const y0 = bez_ds.data[y0key]
              const cx0 = bez_ds.data[cx0key]
              const cy0 = bez_ds.data[cy0key]
              const cx1 = bez_ds.data[cx1key]
              const cy1 = bez_ds.data[cy1key]
              const x1 = bez_ds.data[x1key]
              const y1 = bez_ds.data[y1key]
              const beznumber = x0.length-1
              x0[beznumber] = xs[xs.length-4]
              y0[beznumber] = ys[ys.length-4]
              cx0[beznumber] = xs[xs.length-3]
              cy0[beznumber] = ys[ys.length-3]
              cx1[beznumber] = xs[xs.length-2]
              cy1[beznumber] = ys[ys.length-2]
              x1[beznumber] = xs[xs.length-1]
              y1[beznumber] = ys[ys.length-1]
            }
         }
      }*/
    } else if (mode == 'add') {
      if (xkey) {
        const xidx = cds.data[xkey].length-1
        let xs = cds.get_array<number[]>(xkey)[xidx]
        const nx = xs[xs.length-1]
        xs[xs.length-1] = x
        if (!isArray(xs)) {
          xs = Array.from(xs)
          cds.data[xkey][xidx] = xs
        }
        xs.push(nx)
      }
      if (ykey) {
        const yidx = cds.data[ykey].length-1
        let ys = cds.get_array<number[]>(ykey)[yidx]
        const ny = ys[ys.length-1]
        ys[ys.length-1] = y
        if (!isArray(ys)) {
          ys = Array.from(ys)
          cds.data[ykey][yidx] = ys
        }
        ys.push(ny)
      }
      if(xkey && ykey) {
        this._drawFront(mode)
      }
     }
     this._emit_cds_changes(bez_ds, true, false, emit)
     this._emit_cds_changes(cds, true, false, emit)
  }

  _drawFront(mode: string): void {
    const renderer = this.model.renderers[0]
    const glyph: any = renderer.glyph
    const bez = this.model.renderers.filter(function(element) { return (element.glyph.tags.indexOf("bezier") > -1); })
    const cds = renderer.data_source
    const bez_ds = bez[0].data_source
    const bez_glyph: any = bez[0].glyph
    const [xkey, ykey] = [glyph.xs.field, glyph.ys.field]
    const [x0key, y0key] = [bez_glyph.x0.field, bez_glyph.y0.field]
    const [cx0key, cy0key] = [bez_glyph.cx0.field, bez_glyph.cy0.field]
    const [cx1key, cy1key] = [bez_glyph.cx1.field, bez_glyph.cy1.field]
    const [x1key, y1key] = [bez_glyph.x1.field, bez_glyph.y1.field]
    const xidx = cds.data[xkey].length-1
    let offset = 0
    if(mode =="add") {
        offset = 1;
    }
    const xlen = cds.data[xkey][xidx].length
    if(xlen > 3 + offset)
    {
       console.log(xlen -1)
       if(xlen-1 ==4 || (xlen-(1+offset)) % 3 == 0)
       {
          //xs and ys are one longer than in the 'edit' stanza
          const xs = cds.data[xkey][cds.data[xkey].length-1]
          const ys = cds.data[ykey][cds.data[ykey].length-1]
          const x0 = bez_ds.get_array<number>(x0key)
          const y0 = bez_ds.get_array<number>(y0key)
          const cx0 = bez_ds.get_array<number>(cx0key)
          const cy0 = bez_ds.get_array<number>(cy0key)
          const cx1 = bez_ds.get_array<number>(cx1key)
          const cy1 = bez_ds.get_array<number>(cy1key)
          const x1 = bez_ds.get_array<number>(x1key)
          const y1 = bez_ds.get_array<number>(y1key)
         
        for(var i=0; i < ((xlen-(1+offset))/3); i+=1) {
          const beznumber = ((xlen-(1+offset))/3)-1 //0,1,2,...
          console.log(beznumber)
          x0[beznumber] = xs[3*beznumber +0]
          y0[beznumber] = ys[3*beznumber +0]
          cx0[beznumber] = xs[3*beznumber +1]
          cy0[beznumber] = ys[3*beznumber +1]
          cx1[beznumber] = xs[3*beznumber +2]
          cy1[beznumber] = ys[3*beznumber +2]
          x1[beznumber] = xs[3*beznumber +3]
          y1[beznumber] = ys[3*beznumber +3]
          //add blank entry
          /*x0.push(NaN)
          y0.push(NaN)
          cx0.push(NaN)
          cy0.push(NaN)
          cx1.push(NaN)
          cy1.push(NaN)
          x1.push(NaN)
          y1.push(NaN)*/


          //draw text to fit curve

          //calculate coeffcients (per http://www.planetclegg.com/projects/WarpingTextToSplines.html x0=x0, x1=cx0, x2=cx1, x3=x1 etc.)
          const A = x1[beznumber] - 3*cx1[beznumber] + 3*cx0[beznumber] - x0[beznumber]
          const B = 3 * cx1[beznumber] - 6 * cx0[beznumber] + 3 * x0[beznumber]
          const C = 3 * cx0[beznumber] - 3 * x0[beznumber]
          const D = x0[beznumber]

          const E = y1[beznumber] - 3 * cy1[beznumber] + 3 * cy0[beznumber] - y0[beznumber]
          const F = 3 * cy1[beznumber] - 6 * cy0[beznumber] + 3 * y0[beznumber]
          const G = 3 * cy0[beznumber] - 3 * y0[beznumber]
          const H = y0[beznumber]

          //calculate arc-length (approximately)
          const segments = 200 //number of segments
          let temp_x = []
          let temp_y = []
          let temp_l = [0]
          //Calculating text stamp locations with ' +segments+' segments')
          for(var i=0; i < segments; i+=1)
          {
              let t = i/segments
              temp_x.push(A*t**3 + B*t**2 +C*t +D) //At³ + Bt² + Ct + D
              temp_y.push(E*t**3 + F*t**2 +G*t +H)
              if(i>0){
                 temp_l.push(Math.sqrt((temp_x[temp_x.length-1]-temp_x[temp_x.length-2])**2 + (temp_y[temp_y.length-1]-temp_y[temp_y.length-2])**2)+temp_l[temp_l.length-1])
              }
          }
          const total_length = temp_l[temp_l.length-1]
          const spacing = (this.parent.model.y_range.end - this.parent.model.y_range.start)/100

          //drawing text stamps over '+total_length
          //draw points, text glyph at each one
          const ts = this.model.renderers.filter(function(element) { return (element.glyph.tags.indexOf("text_stamp") > -1); })
          let order=0
          for(var i=0.0; i < total_length; i+=spacing)
          {
              //i is target arc length
              const i_index = temp_l.findIndex(l => l >= i) || 1 //Index of first element larger or equal to i


              let t = temp_l[i_index] / total_length //default if i is already in the table
              if(temp_l[i_index] > i) //if not
              {
                 //interpolate
                 const segmentFraction = (i - temp_l[i_index-1]) / (temp_l[i_index] - temp_l[i_index-1])
                 t = (temp_l[i_index -1] + segmentFraction) / total_length  // 1.x × 
              }
              if(t > 1) 
              {
                 t= 1;
              }

              //calculate angle of text 
              let dx = 3*A*t**2 + 2*B*t + C //derivatives of previous
              let dy = 3*E*t**2 + 2*F*t + G

              let text_ds = ts[order % ts.length].data_source
              text_ds.get_array('x').push(A*t**3 + B*t**2 +C*t +D) //At³ + Bt² + Ct + D
              text_ds.get_array('y').push(E*t**3 + F*t**2 +G*t +H)
              text_ds.get_array('angle').push(Math.atan2(dy,dx))
              order++;
          }
          //ts.data_source.data = text_ds.data
          ts.forEach(function(t) {
            t.data_source.change.emit()
          } ) 
          
        }
       }
     }
    }
  activate(): void {
    /*const multiline_ds = this.model.renderers.filter(function(element) { return (element.glyph.tags.indexOf("multiline") > -1); })
    for(const ml_ds of multiline_ds) {
        const mds = ml_ds.data_source
        mds.connect(mds.properties.data.change, () => this._drawFront('edit'))
    }*/
    if (!this.model.vertex_renderer || !this.model.active)
      return
    this._show_vertices()
    if (!this._initialized) {
      for (const renderer of this.model.renderers) {
        const cds = renderer.data_source
        cds.connect(cds.properties.data.change, () => this._show_vertices())
      }
    }
    this._initialized = true
  }
}

export namespace FrontDrawTool {
  export type Attrs = p.AttrsOf<Props>

  export type Props = PolyTool.Props & {
    drag: p.Property<boolean>
    num_objects: p.Property<number>
  }
}

export interface FrontDrawTool extends FrontDrawTool.Attrs {}

export class FrontDrawTool extends PolyTool {
  properties: FrontDrawTool.Props
  __view_type__: FrontDrawToolView

  constructor(attrs?: Partial<FrontDrawTool.Attrs>) {
    super(attrs)
  }

  static init_FrontDrawTool(): void {
    this.prototype.default_view = FrontDrawToolView

  }

  tool_name = "Polygon Draw Tool"
  icon = bk_tool_icon_poly_draw
  event_type = ["pan" as "pan", "tap" as "tap", "move" as "move"]
  default_order = 3
}

