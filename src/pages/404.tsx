import ErrorComponent from "../components/Error";
export default function NotFoundPage() {
  return <ErrorComponent statusCode={404} />;
}
