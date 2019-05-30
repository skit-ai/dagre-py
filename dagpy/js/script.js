/* global d3 tippy dagreD3 data */

function simplifyName (nodeName) {
  let brk = nodeName.indexOf('__')
  if (brk > -1) {
    return nodeName.slice(0, brk + 10) + '...'
  } else {
    return nodeName
  }
}

function clipDescription (nodeDesc) {
  let maxlen = 200
  if (nodeDesc.length > (maxlen - 3)) {
    return nodeDesc.slice(0, maxlen) + '...'
  } else {
    return nodeDesc
  }
}

function genDescription (node) {
  return JSON.stringify(node.value, null, 2)
}

function timingStats (node) {
  if (node.times.length === 1) {
    return {
      mu: node.times[0],
      sigma: null
    }
  } else if (node.times.length > 1) {
    let sum = node.times.reduce((acc, cur) => acc + cur)
    let mu = sum / node.times.length

    // Sample estimate
    let sigmaSq = node.times.reduce((acc, cur) => acc + ((cur - mu) ** 2)) / (node.times.length - 1)
    return {
      mu: sum / node.times.length,
      sigma: Math.sqrt(sigmaSq)
    }
  } else {
    return null
  }
}

/*
 * Generate text to go in tooltip
 */
function genTooltip (node) {
  let desc = genDescription(node)
  let stats = timingStats(node)
  if (stats) {
    return `⌛ ${stats.mu} (σ ${stats.sigma})<br>${desc}`
  } else {
    return desc
  }
}

document.addEventListener('DOMContentLoaded', function () {
  let g = new dagreD3.graphlib.Graph().setGraph({})

  for (let node of data.nodes) {
    let bg = 'white'
    let fg = '#333'
    if (node.type === 'input') {
      bg = '#333'
      fg = 'white'
    } else if (node.type === 'output') {
      bg = '#008080'
      fg = 'white'
    } else if (!node.evaluated) {
      fg = '#ccc'
    }

    let value = {
      rx: 5,
      ry: 5,
      shape: 'rect',
      label: simplifyName(node.name),
      labelStyle: `fill: ${fg}`,
      style: `fill: ${bg}; stroke: ${fg}`,
      description: genDescription(node),
      ttText: genTooltip(node)
    }
    g.setNode(node.name, value)
  }

  let shouldDisableEdge = edge => {
    let nodeNames = data.nodes.filter(n => !n.evaluated).map(n => n.name)
    return nodeNames.includes(edge[0]) || nodeNames.includes(edge[1])
  }

  for (let edge of data.edges) {
    let arrowProps = { arrowhead: 'vee' }
    let disabledShade = '#ccc'
    if (shouldDisableEdge(edge)) {
      g.setEdge(edge[0], edge[1], {
        arrowheadStyle: `stroke: ${disabledShade}; fill: ${disabledShade};`,
        style: `stroke: ${disabledShade}; fill: transparent;`,
        ...arrowProps
      })
    } else {
      g.setEdge(edge[0], edge[1], arrowProps)
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
    .attr('title', v => clipDescription(g.node(v).ttText))

  inner.selectAll('g.node')
    .on('click', function (v) {
      let node = g.node(v)
      d3.select('.desc').html(node.description)
      d3.select('.title').text(node.label)
    })

  tippy('g.node', { size: 'small', interactive: true })
})
