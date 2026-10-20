import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import JobCard from "./JobCard.jsx";

// Career page: all open positions in a 2-column grid (no carousel).
export default function JobsGrid({ jobs }) {
  return (
    <Container>
      <ul className="m-0 grid list-none gap-4 p-0 lg:grid-cols-2 lg:gap-[1.2vw]">
        {jobs.map((job, i) => (
          <li key={job.title}>
            <Reveal y={50} delay={(i % 2) * 0.08}>
              <JobCard job={job} grid />
            </Reveal>
          </li>
        ))}
      </ul>
    </Container>
  );
}
