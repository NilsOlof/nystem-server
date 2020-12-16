import React, { useContext } from "react";
import { Wrapper, DatabaseSearchContext } from "nystem-components";
import app from "nystem";

const ViewListListStat = ({ model }) => {
  const { search } = useContext(DatabaseSearchContext);
  function total() {
    if (
      search.searchTotal === search.total ||
      model.show.indexOf("total") === -1
    )
      return null;
    return (
      <Wrapper renderAs="span">
        {`, ${search.total}${app().t(" in total")}`}
      </Wrapper>
    );
  }

  let text = "";
  if (!model.show) model.show = [];
  if (model.show.indexOf("currentPos") !== -1)
    text += search.position ? search.position : 0;
  if (
    model.show.indexOf("currentPos") !== -1 &&
    model.show.indexOf("toPos") !== -1
  )
    text += " - ";
  if (model.show.indexOf("toPos") !== -1)
    text += search.count ? search.count : 0;
  if (
    model.show.indexOf("searchTotal") !== -1 &&
    (model.show.indexOf("currentPos") !== -1 ||
      model.show.indexOf("toPos") !== -1)
  )
    text += " of ";
  if (model.show.indexOf("searchTotal") !== -1)
    text += search.searchTotal ? search.searchTotal : 0;

  /* const toPos = settings.searchTotal < settings.position + settings.count
      ? settings.searchTotal
      : settings.position + settings.count; */
  return (
    <Wrapper className={[model.className, "control-label"]}>
      <Wrapper>{model.text}</Wrapper>
      <Wrapper>{text}</Wrapper>
      {total()}
    </Wrapper>
  );
};
export default ViewListListStat;
