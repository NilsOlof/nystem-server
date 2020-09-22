React.createClass({
  render: function() {
    var beforePos = 0;
    var afterPos = 0;
    var first = true;

    function oneRow(item, index) {
      if (index > 5 && index != val.length - 1) {
        if (item.substring(0, 4) == "::::") {
          var pos = item.substring(4).split(":");
          beforePos = pos[0] - 1;
          afterPos = pos[2] - 1;
          if (!first) return <hr />;
          first = false;
          return null;
        }

        var type = "";
        if (item[0] == "-") type = "row-remove";
        if (item[0] == "+") type = "row-add";
        if (type != "row-add") beforePos++;
        if (type != "row-remove") afterPos++;
        if (type) item = item[0] + " " + item.substring(1);
        else item = "  " + item.substring(1);
        console.log(item);
        return (
          <div className="row code">
            <span className="row-counter">
              {type != "row-add" ? beforePos : " "}&nbsp;
            </span>
            <span className="row-counter">
              {type != "row-remove" ? afterPos : " "}&nbsp;
            </span>
            <div
              className={type + ""}
              dangerouslySetInnerHTML={{
                __html: item
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/ /g, "&nbsp;")
                  .replace(/\[m/g, "")
              }}
            />
          </div>
        );
      }
      return null;
    }

    var val = this.props.value
      .replace(
        /@@ -([0-9]+),([0-9]+) \+([0-9]+),([0-9]+) @@(\[m \[m)?/img,
        function(str, p1, p2, p3, p4, offset, s) {
          return "::::" + p1 + ":" + p2 + ":" + p3 + ":" + p4 + "";
        }
      )
      .replace(/\t/g, "<tt>"); //.replace(/\-\[m/gi, '<--->').replace(/\+\[m/gi, '<+++>');
    //if (val.indexOf('[m')!=-1)
    //  val = val.replace(/[\r\n]/g,'').split('[m');
    //else
    val = val.split(/\r?\n/g);

    console.log(val);
    return (
      <Panel
        expandable="true"
        expanded={this.props.expanded}
        icon="true"
        type="default"
      >
        <h3 onClickExpand="true">{this.props.text}</h3>
        <div className="git-diff">
          <div>{val.map(oneRow)}</div>
        </div>
      </Panel>
    );
  }
});
