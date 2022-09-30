const margin = {
    top: 0,
    right: 10, 
    bottom: 90,
    left: 0
}

let width = 1050 - margin.left - margin.right;
let height = 1400  - margin.top - margin.bottom;

// tooltip
const tooltip = d3.select("#chart")
                .append("div")
                .style("border", "solid")
                .style("border-radius", "5px")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("width", "400px")
                .style("background-color", "white")
                .style("padding", "5px")
                .style("font-family", "sans-serif")
                .style("font-size", "14px")
                .style("stroke", "none")

const mouseover = e => {
    tooltip
        .style("opacity", 1)
    d3.select(this)
        .style("stroke", "red")
}

const mousemove = e => {
    tooltip
        .html(`
        <strong>Sales:</strong> ${e.toElement.__data__.data.value} Million<br>
        <strong>Release-Date:</strong> ${e.toElement.__data__.data.date}<br>
        <strong>About:</strong> ${e.toElement.__data__.data.note}`)
    .style("left", `${e.pageX + 15}px`)
    .style("top", `${e.pageY}px`)
}

const mouseleave = e => {
    tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
}

// linebreak for text
let fontSize = 11
function wrapText(selection) {
    selection.each(function () {
      const node = d3.select(this);
      const rectWidth = +node.attr('data-width');
      let word;
      const words = node.text().split(' ').reverse();
      let line = [];
      const x = node.attr('x');
      const y = node.attr('y');
      let tspan = node.text('').append('tspan').attr('x', x).attr('y', y);
      let lineNumber = 0;
      while (words.length > 1) {
        word = words.pop();
        line.push(word);
        tspan.text(line.join(' '));
        const tspanLength = tspan.node().getComputedTextLength();
        if (tspanLength > rectWidth && line.length !== 1) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = addTspan(word);
        }
      }
      
      addTspan(words.pop());
  
      function addTspan(text) {
        lineNumber += 1;
        return (
          node
            .append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dy', `${lineNumber * fontSize}px`)
            .text(text)
        );
      }
    });
  }

// color
let color = d3.scaleOrdinal()
            .domain(["200Mil", "100Mil", "50Mil", "20Mil"])
            .range(["#7FBCD2", "#F2D388", "#AEBDCA", "#ABD9FF"])
// scale font-size
let font = d3.scaleOrdinal()
            .domain(["200Mil", "100Mil", "50Mil", "20Mil"])
            .range(["16px", "14px", "12px", "10px"])

// chart
let svg = d3.select("#chart")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
            .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                
// call data
Promise.all([
    d3.json("data.json")
]).then(function(data) {
        data = data[0]
        let root = d3.hierarchy(data).sum(function(d) {return d.value})
        d3.treemap()
            .size([width, height])
            .padding(2)
            .paddingOuter(8)
            (root)

    svg.selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .style("stroke", "black")
            .style("fill", d => color(d.data.parent))
            .on("mouseover" ,mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    
    svg.selectAll("notBig")
        .data(root.leaves())
        .enter()
        .append("text")
            .attr("x", d => d.x0 + 5)
            .attr("y", d => d.y0 + 20)
            .text(d => {if (d.data.parent !== "200Mil") {return d.data.name}})
            .style("font-size", d => font(d.data.parent))
            .style("fill", "black")
            .call(wrapText)
            // .attr("font-weight", "bold")
            // .style("text-transform", "uppercase")

    svg.selectAll("big")
        .data(root.leaves())
        .enter()
        .append("text")
            .attr("x", d => d.x0 + 5)
            .attr("y", d => d.y0 + 30)
            .text(d => {if (d.data.parent === "200Mil") {return d.data.name}})
            .style("font-size", d => font(d.data.parent))
            .style("fill", "black")
            // .attr("font-weight", "bold")
            // .style("text-transform", "uppercase")
    })           

// legend
let legendScale = d3.scaleOrdinal()
                    .domain(["At least 200 million sales", "At least 100 million sales", "At least 50 million sales", "At least 20 million sales"])
                    .range(["#7FBCD2", "#F2D388", "#AEBDCA", "#ABD9FF"])

let legend = d3.select("#legend")
        .append("svg")
            .attr("width", "210px")
            .attr("height", "100px")
            .style("border", "solid")
        .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(10, 10)`)

let legendOrdinal = d3.legendColor()
                    .scale(legendScale)

legend.call(legendOrdinal)