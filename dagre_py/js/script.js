/* global d3 tippy dagreD3 data */

document.addEventListener('DOMContentLoaded', function () {
  let g = new dagreD3.graphlib.Graph({multigraph: true}).setGraph({})

  // A few global attributes
  if (data.attributes && data.attributes.rankdir) {
    g.graph().rankDir = data.attributes.rankdir
  }

  const disabledShade = '#ccc'

  for (let node of data.nodes) {
    let defaultBg = 'white'
    let defaultFg = '#333'
    let fg, bg

    if (node.attributes) {
      // NOTE: `disabled` takes priority for now
      if (node.attributes.disabled) {
        fg = disabledShade
      } else if (node.attributes.style) {
        fg = node.attributes.style.stroke
        bg = node.attributes.style.fill
      }
    }

    let value = {
      rx: 3,
      ry: 3,
      shape: 'rect',
      label: node.label,
      labelStyle: `fill: ${fg || defaultFg}`,
      style: `fill: ${bg || defaultBg}; stroke: ${fg || defaultFg}`,
      description: node.description || node.label,
      ttText: node.tooltip || node.description || node.label
    }
    if ("id" in node) {
        g.setNode(node.id, value)
    } else {
        g.setNode(node.label, value)
    }
  }

  for (let edge of data.edges) {
    let arrowProps = { arrowhead: 'vee', label: edge.label}

    if (edge.attributes && edge.attributes.disabled) {
      g.setEdge(edge.source, edge.target, {
        arrowheadStyle: `stroke: ${disabledShade}; fill: ${disabledShade};`,
        style: `stroke: ${disabledShade}; fill: transparent;`,
        ...arrowProps
      })
    } else {
      g.setEdge(edge.source, edge.target, arrowProps)
    }
  }

  let render = new dagreD3.render()

  let svg = d3.select('svg')
  let inner = svg.append('g')

  let zoom = d3.zoom().on('zoom', function () {
    inner.attr('transform', d3.event.transform)
  })

  render(inner, g)
  svg.call(zoom)

  let { height, width } = svg.node().getBoundingClientRect()
  svg.call(zoom.transform, d3.zoomIdentity.translate((width - g.graph().width) / 2, (height - g.graph().height) / 2))

  inner.selectAll('g.node')
    .attr('title', v => g.node(v).ttText)

  inner.selectAll('g.node')
    .on('click', function (v) {
      let node = g.node(v)
      d3.select('.desc').html(node.description)
      d3.select('.title').text(node.label)
    })

  tippy('g.node', { size: 'small', interactive: true })
})
