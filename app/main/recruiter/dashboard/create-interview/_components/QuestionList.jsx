"use client";
import { UserAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/services/supabaseClient";

function QuestionList({ formData, onCreateLink }) {
  const [loading, setLoading] = useState(true);
  const [questionList, setQuestionList] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("behavioral");

  const { userProfile: user, updateUserCredits } = UserAuth();

  const hasCalled = useRef(false);

  useEffect(() => {
    if (formData && !hasCalled.current) {
      GenerateQuestionList();
    }
  }, [formData]);

  // ✅ FIXED FUNCTION
  const GenerateQuestionList = async () => {
    setLoading(true);
    hasCalled.current = true;

    try {
      const result = await axios.post("/api/ai-model", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API response:", result.data);

      // Surface API-level errors (e.g. 402 insufficient credits)
      if (result?.data?.error) {
        toast.error(`AI Error: ${result.data.error}`);
        setLoading(false);
        return;
      }

      const rawContent =
        result?.data?.content || result?.data?.Content || "";

      if (!rawContent) {
        toast.error("No response from AI. Please try again.");
        setLoading(false);
        return;
      }

      let parsedData;

      try {
        parsedData = JSON.parse(rawContent);
      } catch {
        const match = rawContent.match(/\{[\s\S]*\}/);

        if (!match) {
          console.log(rawContent);
          toast("Invalid format");
          setLoading(false);
          return;
        }

        try {
          parsedData = JSON.parse(match[0]);
        } catch (parseErr) {
          console.log("Failed to parse matched JSON", parseErr);
          toast("Failed to parse JSON response");
          setLoading(false);
          return;
        }
      }

      // Normalize keys in case model returned different variations
      if (parsedData) {
        const questionsArray =
          parsedData.interviewQuestions ||
          parsedData.InterviewQuestions ||
          parsedData.questions ||
          parsedData.Questions;

        if (questionsArray && !parsedData.interviewQuestions) {
          parsedData.interviewQuestions = questionsArray;
        }
      }

      setQuestionList(parsedData);
    } catch (e) {
      console.log(e);
      toast("Server error");
    }

    setLoading(false);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast("Enter question");
      return;
    }

    setQuestionList((prev) => ({
      ...prev,
      interviewQuestions: [
        ...prev.interviewQuestions,
        {
          question: newQuestion,
          type: newQuestionType,
        },
      ],
    }));

    setNewQuestion("");
  };

  const handleDeleteQuestion = (index) => {
    setQuestionList((prev) => {
      const updated = [...prev.interviewQuestions];
      updated.splice(index, 1);

      return {
        ...prev,
        interviewQuestions: updated,
      };
    });
  };

  const onFinish = async () => {
    if (!questionList?.interviewQuestions?.length) {
      toast.error("No questions to save. Please generate questions first.");
      return;
    }

    setSaveLoading(true);
    const interview_id = uuidv4();

    try {
      // Fetch fresh user data to get current credits
      const { data: freshUser, error: userErr } = await supabase
        .from("users")
        .select("credits, email")
        .eq("email", user?.email)
        .single();

      if (userErr || !freshUser) {
        toast.error("Could not verify your account. Please log in again.");
        setSaveLoading(false);
        return;
      }

      const currentCredits = freshUser.credits ?? 0;

      if (currentCredits <= 0) {
        toast.error("You have no credits remaining. Please purchase more.");
        setSaveLoading(false);
        return;
      }

      // Deduct 1 credit
      const creditResult = await updateUserCredits(currentCredits - 1);
      if (!creditResult?.success) {
        toast.error("Failed to deduct credits. Please try again.");
        setSaveLoading(false);
        return;
      }

      // Normalize type: store as string (comma-separated if array)
      const typeValue = Array.isArray(formData.type)
        ? formData.type.join(", ")
        : formData.type || "";

      // Save interview to DB
      const { error: insertError } = await supabase
        .from("interviews")
        .insert([
          {
            jobPosition: formData.jobPosition,
            jobDescription: formData.jobDescription,
            duration: formData.duration,
            type: typeValue,
            questionList: questionList,
            userEmail: user?.email,
            interview_id: interview_id,
          },
        ]);

      if (insertError) {
        // Rollback the credit deduction
        await updateUserCredits(currentCredits);
        toast.error(`Failed to save interview: ${insertError.message}`);
        setSaveLoading(false);
        return;
      }

      toast.success("Interview created successfully!");
      onCreateLink(interview_id);

    } catch (e) {
      console.error("onFinish error:", e);
      toast.error("Unexpected error. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };


  return (
    <div>
      {loading && (
        <div className="flex flex-col items-center mt-10">
          <Loader2Icon className="animate-spin" />
          <p>Generating Questions...</p>
        </div>
      )}

      {!loading &&
        questionList &&
        questionList.interviewQuestions && (
          <div>

            <h2 className="text-xl font-bold">
              Generated Questions
            </h2>

            {questionList.interviewQuestions.map(
              (item, index) => (
                <div
                  key={index}
                  className="border p-3 mt-2 flex justify-between"
                >
                  <div>
                    {index + 1}. {item.question}
                    <p>Type: {item.type}</p>
                  </div>

                  <Trash2Icon
                    onClick={() =>
                      handleDeleteQuestion(index)
                    }
                  />
                </div>
              )
            )}

            <div className="mt-5 flex gap-2">

              <input
                value={newQuestion}
                onChange={(e) =>
                  setNewQuestion(e.target.value)
                }
                placeholder="New question"
                className="border p-2"
              />

              <select
                value={newQuestionType}
                onChange={(e) =>
                  setNewQuestionType(e.target.value)
                }
              >
                <option value="technical">
                  Technical
                </option>

                <option value="behavioral">
                  Behavioral
                </option>
              </select>

              <Button onClick={handleAddQuestion}>
                <PlusIcon />
              </Button>

            </div>

            <div className="mt-6">

              <Button
                onClick={onFinish}
                disabled={saveLoading}
              >
                {saveLoading
                  ? "Saving..."
                  : "Finish"}
              </Button>

            </div>

          </div>
        )}
    </div>
  );
}

export default QuestionList;