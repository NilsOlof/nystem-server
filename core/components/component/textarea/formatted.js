import { Wrapper } from "nystem-components";

const TextareaFormatted = ({ model, value }) => (
  <Wrapper
    className={model.className}
    renderAs={model.renderAs}
    translate={model.translate}
    dangerouslySetInnerHTML={{
      __html: (value || model.fallback || "")
        .substring(0, model.cutPoint || 100000)
        .replace(
          /(https?:\/\/[^\s]+)/gim,
          '<a target="_blank" class="text-gray-400" href="$1">$1</a>'
        )
        .replace(/[\n]/g, "<br>"),
    }}
  />
);

export default TextareaFormatted;
