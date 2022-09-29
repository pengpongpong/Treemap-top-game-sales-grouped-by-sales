const margin = {
    top: 0,
    right: 10, 
    bottom: 10,
    left: 0
}

let width = 1000;
let height = 1000;

let svg = d3.select("#chart")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
            .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)

d3.json("data.json", function(data) {
    // console.log(data)
    let root = d3.hierarchy(data).sum(function(d) {return d.value})
// console.log(root.leaves())
    d3.treemap()
        .size([width, height])
        .padding(2)
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
        .style("fill", "#d3d3d3")

svg.selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0 + 20)
        .text(d => d.data.name)
        .attr("font-size", "10px")
        .attr("fill", "steelblue")
})