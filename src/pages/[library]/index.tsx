import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const params = router.query;
  console.log(params);
  return <div>Welcome to library/home</div>;
};

export default Home;
