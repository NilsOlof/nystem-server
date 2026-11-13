import { Image } from "nystem-components";

const ViewImageProjectIcon = ({ view }) => {
  return (
    <span aria-hidden="true" className="mr-2 block size-5 shrink-0">
      {view.value?.projectIcon && (
        <Image
          alt=""
          width={20}
          height={20}
          className="block size-full object-contain"
          src={`/project-icon/${view.id}.png?v=${view.value.projectIcon}`}
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
          key={view.value.projectIcon}
        />
      )}
    </span>
  );
};

export default ViewImageProjectIcon;
