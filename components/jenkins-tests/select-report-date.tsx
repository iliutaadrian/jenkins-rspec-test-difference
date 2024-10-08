"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { BuildFull, ReportJenkins } from "@/types";
import { Copy } from "lucide-react";
import React, { useEffect } from "react";
import {
  useReportsJenkinsStore,
  useStepStore,
  useSelectedJenkinsReportsStore,
  useSettingsStore,
} from "../reports-jenkins-store";
import { toast } from "../ui/use-toast";
import { db } from "@vercel/postgres";

interface Props {
  builds: BuildFull[];
}

export const SelectReportDate = ({ builds }: Props) => {
  const { reports } = useReportsJenkinsStore();
  const { step, setStep } = useStepStore();
  const { selectedReport_1, selectedReport_2, setSelectedReport_1, setSelectedReport_2 } = useSelectedJenkinsReportsStore();
  const { settings, setSettings } = useSettingsStore()

  const [value, setValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const [markdown, setMarkdown] = React.useState("");

  const lastBuild = builds?.length ? builds[builds.length - 1] : {
    number_of_failures: "x",
    build: "xxxx",
    date: "XXX, xx XX XX",
    link: "#",
  };

  const reportsList =
    reports.length > 0
      ? reports
        .map((report: ReportJenkins) => ({
          label: `#${report.build} - ${report.date} - ${report.number_of_failures} failures`,
          value: report.build,
        }))
        .sort((a: any, b: any) => b.value - a.value)
      : [];

  useEffect(() => {
    if (reports.length > 0) {
      select_report(reports[reports.length - 4].build);
    }
  }, [reports]);

  const select_report = async (value: any, init = false) => {
    setValue(value);
    let last = reports[reportsList.length - 1];
    let selected = reports.find((report) => report.build === value);

    if (!selected || !last) {
      toast({
        variant: "destructive",
        description: "Select a valid report date.",
      });
      return;
    }

    setSelectedReport_1(selected);
    setSelectedReport_2(last);

    setMarkdown(`
**Test Suite Status** <br />
Test failures ${last.date} - [Build #${last.build}](${last.link}): ${last.number_of_failures} failures currently <br />
Test failures ${selected.date} - [Build #${selected.build}](${selected.link}): ${selected.number_of_failures} failures in the last deployment
`);

    setIsLoading(false);
    setStep(3);
    return;
  };

  const copyMarkdown = () => {
    setSettings({ ...settings, last_deploy: selectedReport_2.build }, () => {
      navigator.clipboard.writeText(markdown.replace(/\<br \/\>/g, ""));
      toast({
        description: `Markdown copied to clipboard. Last deployment: #${selectedReport_2.build}.`,
      });
    })
  };
  return (
    <Card className="shadow-neon border-muted-foreground bg-primary/5 hover:bg-primary/10 pb-2">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-full border-2 border-primary flex justify-center items-center">
              <p>2.</p>
            </div>
            Select Report Date
          </div>
        </CardTitle>
        <CardDescription>
          Select the date of the build in the last deployment. By copying the build you set a new deployment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex gap-5 items-center">
          <Combobox
            disabled={step > 1 ? false : true}
            list={reportsList}
            text="Select your report..."
            value={value}
            setValue={select_report}
          />
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex flex-col gap-2">
        {markdown ? (
          <div className="bg-gray-800 text-white p-5 text-sm w-full rounded-sm relative">
            <Copy
              className="w-5 h-5 absolute top-2 right-2 z-10 hover:text-primary cursor-pointer"
              onClick={() => copyMarkdown()}
            />
            <div dangerouslySetInnerHTML={{ __html: markdown }}></div>
          </div>
        ) : (
          <div className="bg-gray-800 text-white p-5 text-sm w-full rounded-sm">
            **Test Suite Status** <br />
            Test failures today - [Build
            #{lastBuild.build}]({lastBuild.link}):{" "}
            {lastBuild.number_of_failures} failures currently
            <br />
            Test failures before - [Build
            #xxxx](http://s3.amazonaws.com/xxxxxxxxxx-xxx/coverage/20xx-xx-xx/xx-xx/rspec.txt):
            x failures in the last deployment
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
