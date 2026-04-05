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

    const result = await axios.post(
      "/api/ai-model",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API:", result.data);

    const rawContent =
      result?.data?.content ||
      result?.data?.Content ||
      "";

    if (!rawContent) {
      toast("No response");
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

      parsedData = JSON.parse(match[0]);
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
    setSaveLoading(true);

    const interview_id = uuidv4();

    try {
      const currentCredits = user?.credits || 0;

      if (currentCredits <= 0) {
        toast.error("No credits");
        setSaveLoading(false);
        return;
      }

      const newCredits = currentCredits - 1;

      await updateUserCredits(newCredits);

      const { error } = await supabase
        .from("Interviews")
        .insert([
          {
            ...formData,
            questionList: questionList,
            userEmail: user?.email,
            interview_id: interview_id,
          },
        ]);

      setSaveLoading(false);

      if (error) {
        toast("Save failed");
        return;
      }

      toast.success("Saved");
      onCreateLink(interview_id);

    } catch (e) {
      console.log(e);
      toast("Error");
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