function embedding (divId) {
	this.divId = divId;
	d3.select("#" + this.divId).append("svg").attr("class", "embedding")
		.style("width", 450)
		.style("height", 520);
}

export { embedding };