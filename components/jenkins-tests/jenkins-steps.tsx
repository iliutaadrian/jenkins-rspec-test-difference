"use client";
import { FetchData } from "@/components/jenkins-tests/fetch-data";
import { GenerateDiff } from "@/components/jenkins-tests/generate-diff";
import { SelectReportDate } from "@/components/jenkins-tests/select-report-date";
import { ComboList } from "@/types";
import { Analytics } from "./analytics";
import { Bookmarks } from "./bookmarks";

interface Props {
  project: ComboList[];
  bookmarks: { name: string; url: string }[];
  builds: { buildsNumber: string[]; buildsFailed: string[] } | null;
}
export const JenkinsSteps = ({ project, bookmarks, builds }: Props) => {
  return (
    <div className="p-10 max-w-5xl mx-auto flex flex-col gap-5">
      {builds && <Analytics builds={builds} />}
      <Bookmarks bookmarks={bookmarks} />
      <FetchData project={project} />
      <SelectReportDate />
      <GenerateDiff />
    </div>
  );
};
