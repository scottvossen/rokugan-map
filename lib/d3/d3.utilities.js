/* Extend d3 with utilities */
(function(d3) {
  d3.selection.prototype.clone = function(selection, i, prependSelector) {
    // Assume the selection contains only one object, or just work
    // on the first object. 'i' is an index to add to the id of the
    // newly cloned DOM element.
    var attr = selection.node().attributes;
    var length = attr.length;
    var node_name = selection.property("nodeName");
    var parent = d3.select(selection.node().parentNode);

    var cloned = null;
    if (prependSelector) {
      cloned = parent.insert(node_name, prependSelector)
                 .attr("id", selection.attr("id") + i);
    } else {
      cloned = parent.append(node_name)
                 .attr("id", selection.attr("id") + i);
    }
    for (var j = 0; j < length; j++) { // Iterate on attributes and skip on "id"
        if (attr[j].nodeName == "id") continue;
        cloned.attr(attr[j].name,attr[j].value);
    }
    return cloned;
  }

  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };

  d3.selection.prototype.moveToBack = function() { 
      return this.each(function() { 
          var firstChild = this.parentNode.firstChild; 
          if (firstChild) { 
              this.parentNode.insertBefore(this, firstChild); 
          } 
      }); 
  };
})(d3);