import { ContentTypeView } from "nystem-components";
import { Route } from "react-router-dom";
import React from "react";

const Inserter = (props) => {
  const { match, className, children, source, exclude } = props;
  const exact = !(match && match.indexOf("*") === match.length - 1);
  const propMatch = exact ? match : match.substring(0, match.length - 1);

  return (
    <Route
      className={children instanceof Array && className}
      path={match || source}
      exact={exact}
    >
      {({ location, match }) => {
        if (!match || exclude === location.pathname) return null;

        if (children)
          return children instanceof Array && children.length ? (
            <div className={className}>{children}</div>
          ) : (
            children
          );

        let path = location.pathname;
        if (source && (exact || source.indexOf("*") === -1)) path = source;
        else if (propMatch && source) {
          const replace = propMatch.replace(source, "");
          path =
            source.substring(0, source.length - 1) + path.replace(replace, "");
        }

        path = path.split("/");

        return (
          <ContentTypeView
            className={className}
            contentType={path[1]}
            format={path[2]}
            id={path[3]}
            location={location}
            params={location.pathname.split("/").slice(1)}
            path={path}
            key={location.pathname}
            noForm={props.noForm}
          />
        );
      }}
    </Route>
  );
};
export default Inserter;
