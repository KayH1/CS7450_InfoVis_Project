function embedding (divId) {
	this.divId = divId;
	d3.select("#" + this.divId).append("svg").attr("class", "embedding")
		.attr("width", 450)
		.attr("height", 520);
}

export { embedding };