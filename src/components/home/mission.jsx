import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Terminal,
  ShieldCheck,
  MessageSquareCode,
  Sparkles,
  SendHorizontal,
  Loader2,
  RefreshCw,
  GitPullRequest,
  AlertCircle,
} from "lucide-react";
import { LuArrowUpRight } from "react-icons/lu";
import { usePRAnalysis, useAskOcto } from "@/hooks/useAgent";

const MainMissionContainer = ({
  activities = [],
  actionableItems = [],
  summary = null,
  loading: activityLoading = false,
  onRefresh,
}) => {
  const {
    analysis,
    loading: analysisLoading,
    analyzePR,
    clearAnalysis,
  } = usePRAnalysis();
  const { ask, loading: askLoading, response: octoResponse } = useAskOcto();

  const [askInput, setAskInput] = useState("");
  const [selectedMission, setSelectedMission] = useState(null);

  // Default fallback data when no AI analysis is available
  const defaultSteps = [
    { id: 1, text: "Select a PR or issue to analyze", status: "current" },
    { id: 2, text: "Octo will generate actionable steps", status: "pending" },
    { id: 3, text: "Follow the AI-powered roadmap", status: "pending" },
  ];

  // Use AI analysis if available, otherwise use defaults
  const steps =
    analysis?.steps?.map((step, index) => ({
      ...step,
      status: index === 0 ? "current" : "pending",
    })) || defaultSteps;

  const octoStatus =
    analysis?.octoStatus ||
    (actionableItems.length > 0
      ? `You have ${actionableItems.length} item${actionableItems.length > 1 ? "s" : ""} that need attention. Click on one to see what Octo suggests!`
      : "No active mission selected. Pick a PR or issue from your activity feed to get started!");

  const complexity = analysis?.complexity || "normal";
  const progressPercent = analysis?.progressPercent || 0;

  // Get mission info from analysis or first actionable item
  const missionTitle =
    analysis?.prTitle ||
    selectedMission?.title ||
    actionableItems[0]?.title ||
    "No Active Mission";
  const missionNumber =
    analysis?.prNumber ||
    selectedMission?.number ||
    actionableItems[0]?.subtitle?.match(/#(\d+)/)?.[1] ||
    "";
  const missionRepo =
    analysis?.repo ||
    selectedMission?.repo ||
    actionableItems[0]?.subtitle?.split("#")[0] ||
    "";
  const missionUrl =
    analysis?.prUrl || selectedMission?.url || actionableItems[0]?.url;
  const missionState = analysis?.prState || "open";

  // Handle selecting a mission from actionable items
  useEffect(() => {
    if (actionableItems.length > 0 && !selectedMission && !analysis) {
      const firstItem = actionableItems[0];
      if (firstItem.type === "pull_request" || firstItem.type === "review") {
        // Extract owner/repo from subtitle
        const repoMatch = firstItem.subtitle?.match(/(.+)#(\d+)/);
        if (repoMatch) {
          const [fullRepo, number] = [repoMatch[1], repoMatch[2]];
          const [owner, repo] = fullRepo.split("/");
          setSelectedMission({
            ...firstItem,
            owner,
            repo,
            number: parseInt(number),
          });
        }
      }
    }
  }, [actionableItems, selectedMission, analysis]);

  // Analyze PR when mission is selected
  const handleAnalyzeMission = async () => {
    if (
      selectedMission?.owner &&
      selectedMission?.repo &&
      selectedMission?.number
    ) {
      await analyzePR(
        selectedMission.owner,
        selectedMission.repo,
        selectedMission.number,
      );
    }
  };

  // Handle Ask Octo
  const handleAskOcto = async (e) => {
    e.preventDefault();
    if (!askInput.trim()) return;

    await ask(askInput, {
      prTitle: missionTitle,
      status: missionState,
      recentFeedback: octoStatus,
    });
    setAskInput("");
  };

  // Get status badge based on state
  const getStatusBadge = () => {
    if (analysis?.prState === "closed" || analysis?.prState === "merged") {
      return {
        text: "MERGED",
        color: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      };
    }
    if (actionableItems.some((item) => item.action === "Changes Requested")) {
      return {
        text: "CHANGES REQUESTED",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    }
    if (actionableItems.some((item) => item.action === "Approved")) {
      return {
        text: "APPROVED",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }
    return {
      text: "IN PROGRESS",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
  };

  const statusBadge = getStatusBadge();
  const isLoading = activityLoading || analysisLoading;

  return (
    <div className="h-full w-full my-2 border-2 border-neutral-600 rounded-3xl bg-[#161616] shadow-2xl overflow-hidden flex flex-col">
      {/* 1. Header Area: Identity & Status */}
      <div className="px-4 py-3 border-b-3 w-full border-neutral-600 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-black rounded-xl border-2 border-neutral-500">
            {isLoading ? (
              <Loader2 className="text-white size-6 animate-spin" />
            ) : (
              <Terminal className="text-white size-6" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-stone-500 text-[10px] font-black uppercase tracking-widest">
                Current Mission
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}
              >
                {statusBadge.text}
              </span>
              {analysis?.fromCache && (
                <span className="text-neutral-500 text-[10px]">(cached)</span>
              )}
            </div>
            <h1 className="text-2xl font-medium text-white">
              {missionNumber ? `#${missionNumber} : ` : ""}
              {missionTitle}
            </h1>
            <div className="flex gap-1 items-center">
              {missionRepo ? (
                <>
                  <GitPullRequest className="size-4 text-neutral-400" />
                  <span className="text-xs text-neutral-400">
                    {missionRepo}
                  </span>
                </>
              ) : (
                <span className="text-xs text-neutral-400">
                  Select a PR or issue to begin
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedMission && !analysis && (
            <button
              onClick={handleAnalyzeMission}
              disabled={analysisLoading}
              className="px-3 py-2 text-sm flex items-center gap-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors border border-neutral-600 text-white disabled:opacity-50"
            >
              {analysisLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Analyze
            </button>
          )}
          {analysis && (
            <button
              onClick={() => {
                clearAnalysis();
                setSelectedMission(null);
              }}
              className="px-3 py-2 text-sm flex items-center gap-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors border border-neutral-600 text-white"
            >
              <RefreshCw className="size-4" />
              New
            </button>
          )}
          {missionUrl && (
            <button
              onClick={() => window.open(missionUrl, "_blank")}
              className="px-3 py-2 w-24 text-sm flex items-center justify-evenly rounded-full bg-white transition-colors border text-black border-white/10 group hover:bg-neutral-200"
            >
              <p>View</p>
              <LuArrowUpRight className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Content Body: Split Layout */}
      <div className="flex-1 flex px-2 py-2 h-full gap-4 overflow-hidden">
        {/* Left Side: Octo's AI Insight */}
        <div className="w-1/2 h-full flex flex-col justify-between">
          <div className="relative p-5 w-full rounded-3xl border-neutral-800 border-2 bg-black scroll-auto overflow-y-auto custom-scrollbar flex-1 h-full">
            <div className="flex h-full w-full flex-col justify-between">
              <div className="flex w-full flex-col items-start gap-2 mb-3">
                <div className="flex items-center w-full gap-3">
                  <Sparkles className="text-neutral-300 size-4" />
                  <span className="text-white text-2xl font-medium tracking-tighter">
                    Octo Status
                  </span>
                  {analysisLoading && (
                    <Loader2 className="size-4 animate-spin text-neutral-400" />
                  )}
                </div>
                <p className="text-stone-300 text-lg leading-relaxed font-medium italic">
                  "{octoStatus}"
                </p>

                {/* Show Octo's response to questions */}
                {octoResponse && (
                  <div className="mt-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700">
                    <p className="text-emerald-400 text-sm font-medium mb-1">
                      Octo says:
                    </p>
                    <p className="text-stone-300 text-sm">{octoResponse}</p>
                  </div>
                )}
              </div>

              {/* Ask Octo Input */}
              <form
                onSubmit={handleAskOcto}
                className="flex flex-row w-full items-center justify-between"
              >
                <input
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  disabled={askLoading}
                  className="bg-neutral-800 rounded-full w-full h-10 px-4 pr-12 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 disabled:opacity-50"
                  placeholder="Ask Octo anything..."
                />
                <button
                  type="submit"
                  disabled={askLoading || !askInput.trim()}
                  className="absolute right-8 disabled:opacity-30"
                >
                  {askLoading ? (
                    <Loader2 className="size-5 animate-spin text-neutral-400" />
                  ) : (
                    <SendHorizontal className="size-5 text-white hover:text-emerald-400 transition-colors" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: The "Roadmap" (Steps to take) */}
        <div className="w-1/2 flex flex-col">
          <h3 className="text-stone-500 text-[10px] font-black uppercase tracking-widest mb-4">
            Steps to Resolve
            {analysis && (
              <span className="text-emerald-500 ml-2">• AI Generated</span>
            )}
          </h3>
          <div className="space-y-3 w-full overflow-y-auto pr-2 custom-scrollbar">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  step.status === "current"
                    ? "bg-white/5 border-neutral-700 border-2"
                    : step.status === "done"
                      ? "bg-emerald-500/5 border-emerald-500/20 border-2"
                      : "bg-transparent border-neutral-700 border-2 opacity-60"
                }`}
              >
                {step.status === "done" ? (
                  <CheckCircle2 className="text-emerald-400 size-5 mt-0.5 shrink-0" />
                ) : (
                  <Circle
                    className={`${step.status === "current" ? "text-white" : "text-stone-600"} size-5 mt-0.5 shrink-0`}
                  />
                )}
                <p
                  className={`text-sm font-bold ${
                    step.status === "current"
                      ? "text-white"
                      : step.status === "done"
                        ? "text-emerald-400"
                        : "text-stone-400"
                  }`}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          {/* Actionable Items Quick Access */}
          {!analysis && actionableItems.length > 1 && (
            <div className="mt-4 pt-4 border-t border-neutral-700">
              <h4 className="text-neutral-500 text-[10px] font-bold uppercase mb-2">
                Other items needing attention:
              </h4>
              <div className="space-y-1">
                {actionableItems.slice(1, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const repoMatch = item.subtitle?.match(/(.+)#(\d+)/);
                      if (repoMatch) {
                        const [fullRepo, number] = [repoMatch[1], repoMatch[2]];
                        const [owner, repo] = fullRepo.split("/");
                        setSelectedMission({
                          ...item,
                          owner,
                          repo,
                          number: parseInt(number),
                        });
                      }
                    }}
                    className="w-full text-left p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
                  >
                    <p className="text-white text-xs truncate">{item.title}</p>
                    <p className="text-neutral-500 text-[10px]">
                      {item.subtitle}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Footer: AI Context Tracking */}
      <div className="px-6 py-3 bg-black/20 flex justify-between items-center">
        <div className="flex gap-4 text-[10px] font-medium text-stone-400">
          <span className="uppercase">Agent: Octo-AI</span>
          <span className="text-stone-500">|</span>
          <p>
            <span className="uppercase">Complexity: </span>
            <span
              className={
                complexity === "hard"
                  ? "text-red-400"
                  : complexity === "easy"
                    ? "text-emerald-400"
                    : "text-amber-400"
              }
            >
              {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-200 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-neutral-400 uppercase">
            {progressPercent}% Completed
          </span>
        </div>
      </div>
    </div>
  );
};

export default MainMissionContainer;
