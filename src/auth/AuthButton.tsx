/** @jsx jsx */
import { jsx } from "theme-ui";
import { NavButton } from "components/Button";
import { AppAuthMethod } from "interfaces";
import useLogin from "auth/useLogin";

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
  className?: string;
}> = ({ method, className }) => {
  const { description, links } = method;
  const imageUrl = links?.find(link => link.rel === "logo")?.href;
  const name = description ?? "Basic Auth";
  const { getLoginUrl } = useLogin();
  const loginUrl = getLoginUrl(method.id);

  return (
    <NavButton
      aria-label={`Login with ${name}`}
      type="submit"
      className={className}
      sx={{
        ...authButtonstyles,
        backgroundImage: `url(${imageUrl})`
      }}
      href={loginUrl}
    >
      {imageUrl ? "" : `Login with ${name}`}
    </NavButton>
  );
};

export default AuthButton;
