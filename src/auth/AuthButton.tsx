/** @jsx jsx */
import { jsx } from "theme-ui";
import { NavButton } from "components/Button";
import { AppAuthMethod } from "interfaces";
import { useRouter } from "next/router";
import useLibraryContext from "components/context/LibraryContext";

export const authButtonstyles = {
  display: "flex",
  flex: "1 0 auto",
  width: "280px",
  height: "51px",
  backgroundSize: `280px 51px`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0",
  cursor: "pointer",
  border: "none"
};

const AuthButton: React.FC<{
  method: AppAuthMethod;
}> = ({ method }) => {
  const router = useRouter();
  const { slug } = useLibraryContext();
  const { description, links } = method;
  const imageUrl = links?.find(link => link.rel === "logo")?.href;
  const name = description ?? "Basic Auth";

  return (
    <NavButton
      aria-label={`Login with ${name}`}
      type="submit"
      sx={{
        ...authButtonstyles,
        backgroundImage: `url(${imageUrl})`
      }}
      href={{
        pathname: "/[library]/login/[methodId]",
        // preserve the existing url query parameters
        query: {
          ...router.query,
          // provide this specifically so we can link from the home page
          library: slug,
          methodId: method.id
        }
      }}
    >
      {imageUrl ? "" : `Login with ${name}`}
    </NavButton>
  );
};

export default AuthButton;
