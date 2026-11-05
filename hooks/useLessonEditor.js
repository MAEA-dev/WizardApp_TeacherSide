import { useEffect, useState } from "react";

const createQuestionDraft = () => ({
  question: "",
  choices: ["", ""],
  answer: "",
  correctReply: "",
  wrongReply: "",
});

export default function useLessonEditor(aiLesson, lessonId) {
  const [interactiveSteps, setInteractiveSteps] = useState([]);
  const [summary, setSummary] = useState([]);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [draftChoices, setDraftChoices] = useState([]);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [editStepError, setEditStepError] = useState("");
  const [addingStepType, setAddingStepType] = useState(null);
  const [newStepDraft, setNewStepDraft] = useState({});
  const [newStepError, setNewStepError] = useState("");
  const [editingSummaryIndex, setEditingSummaryIndex] = useState(null);

  useEffect(() => {
    setInteractiveSteps(aiLesson?.interactiveSteps ?? []);
    setSummary(aiLesson?.summary ?? []);
    setEditingStepIndex(null);
    setEditingSummaryIndex(null);
    setAddingStepType(null);
  }, [lessonId, aiLesson]);

  const startAddingStep = (type) => {
    setAddingStepType(type);
    setNewStepError("");
    setNewStepDraft(type === "say" ? { text: "" } : createQuestionDraft());
  };

  const addInteractiveStep = () => {
    const text = addingStepType === "say"
      ? newStepDraft.text?.trim()
      : newStepDraft.question?.trim();

    if (!text) {
      setNewStepError(addingStepType === "say" ? "Enter the explanation." : "Enter the question.");
      return;
    }

    if (addingStepType === "say") {
      setInteractiveSteps((steps) => [...steps, { type: "say", text }]);
    } else {
      const choices = newStepDraft.choices.map((choice) => choice.trim()).filter(Boolean);
      const answer = newStepDraft.answer.trim();

      if (choices.length < 2) {
        setNewStepError("Add at least two answer choices.");
        return;
      }
      if (!answer || !choices.includes(answer)) {
        setNewStepError("The correct answer must match one of the choices.");
        return;
      }

      setInteractiveSteps((steps) => [
        ...steps,
        {
          type: "ask",
          questionType: "multiple_choice",
          question: text,
          choices,
          answer,
          correctReply: newStepDraft.correctReply.trim(),
          wrongReply: newStepDraft.wrongReply.trim(),
        },
      ]);
    }

    setAddingStepType(null);
    setNewStepDraft({});
    setNewStepError("");
  };

  const getEditedStep = (step) => {
    const text = draftText.trim();
    if (!text) {
      setEditStepError(step.type === "say" ? "Enter the explanation." : "Enter the question.");
      return null;
    }

    let updatedStep;
    if (step.type === "say") {
      updatedStep = { ...step, text };
    } else {
      const choices = draftChoices.map((choice) => choice.trim()).filter(Boolean);
      const answer = draftAnswer.trim();

      if (choices.length < 2) {
        setEditStepError("Add at least two answer choices.");
        return null;
      }
      if (!answer || !choices.includes(answer)) {
        setEditStepError("The correct answer must match one of the choices.");
        return null;
      }
      updatedStep = { ...step, question: text, choices, answer };
    }

    setEditStepError("");
    return updatedStep;
  };

  const toggleStepEditing = (index, step) => {
    if (editingStepIndex === index) {
      const updatedStep = getEditedStep(step);
      if (!updatedStep) return;

      setInteractiveSteps((steps) =>
        steps.map((item, itemIndex) => itemIndex === index ? updatedStep : item)
      );
      setEditingStepIndex(null);
      return;
    }

    if (editingStepIndex !== null) {
      const currentStep = interactiveSteps[editingStepIndex];
      const updatedStep = getEditedStep(currentStep);
      if (!updatedStep) return;

      setInteractiveSteps((steps) =>
        steps.map((item, itemIndex) =>
          itemIndex === editingStepIndex ? updatedStep : item
        )
      );
    }

    setDraftText(step.type === "say" ? step.text : step.question);
    setDraftChoices(step.choices?.length ? [...step.choices] : ["", ""]);
    setDraftAnswer(step.answer ?? "");
    setEditStepError("");
    setEditingStepIndex(index);
  };

  const updateStepChoice = (index, value) =>
    setDraftChoices((choices) => choices.map((choice, choiceIndex) =>
      choiceIndex === index ? value : choice
    ));

  const addStepChoice = () => setDraftChoices((choices) => [...choices, ""]);

  const removeStepChoice = (index) =>
    setDraftChoices((choices) => choices.filter((_, choiceIndex) => choiceIndex !== index));

  const updateNewChoice = (index, value) =>
    setNewStepDraft((draft) => ({
      ...draft,
      choices: draft.choices.map((choice, choiceIndex) =>
        choiceIndex === index ? value : choice
      ),
    }));

  const addNewChoice = () =>
    setNewStepDraft((draft) => ({ ...draft, choices: [...draft.choices, ""] }));

  const removeNewChoice = (index) =>
    setNewStepDraft((draft) => ({
      ...draft,
      choices: draft.choices.filter((_, choiceIndex) => choiceIndex !== index),
    }));

  const addSummaryPoint = () => {
    setEditingSummaryIndex(summary.length);
    setSummary((items) => [...items, ""]);
  };

  const updateSummaryPoint = (index, text) =>
    setSummary((items) => items.map((item, itemIndex) => itemIndex === index ? text : item));

  const removeSummaryPoint = (index) => {
    setSummary((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setEditingSummaryIndex((current) => {
      if (current === index) return null;
      return current !== null && current > index ? current - 1 : current;
    });
  };

  const getChangesToSave = () => {
    if (addingStepType) {
      setNewStepError("Add or cancel the new step before saving changes.");
      return null;
    }

    let stepsToSave = interactiveSteps;
    if (editingStepIndex !== null) {
      const currentStep = interactiveSteps[editingStepIndex];
      if (!currentStep) return null;

      const updatedStep = getEditedStep(currentStep);
      if (!updatedStep) return null;

      stepsToSave = interactiveSteps.map((step, index) =>
        index === editingStepIndex ? updatedStep : step
      );
      setInteractiveSteps(stepsToSave);
      setEditingStepIndex(null);
    }

    return { interactiveSteps: stepsToSave, summary };
  };

  return {
    interactiveSteps,
    summary,
    editableSteps: interactiveSteps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) =>
        step.type === "say" ||
        (step.type === "ask" && step.questionType === "multiple_choice")
      ),
    editingStepIndex,
    draftText,
    setDraftText,
    draftChoices,
    setDraftChoices,
    updateStepChoice,
    addStepChoice,
    removeStepChoice,
    draftAnswer,
    setDraftAnswer,
    editStepError,
    addingStepType,
    newStepDraft,
    setNewStepDraft,
    setNewStepError,
    updateNewChoice,
    addNewChoice,
    removeNewChoice,
    newStepError,
    editingSummaryIndex,
    setEditingSummaryIndex,
    startAddingStep,
    addInteractiveStep,
    toggleStepEditing,
    addSummaryPoint,
    updateSummaryPoint,
    removeSummaryPoint,
    getChangesToSave,
    cancelAddingStep: () => setAddingStepType(null),
  };
}
