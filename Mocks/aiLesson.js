export const MOCK_AI_LESSON_ID = "g5-math-fraction-001";

export const MockAiLesson = {
  aiLesson: {
    finalMessage:
      "You've done a fantastic job with fractions today! Keep practicing, and you'll be a fraction wizard in no time!",
    interactiveSteps: [
      {
        text: "Ang fractions ay parang mga piraso ng isang buo. Ginagamit natin ito para ipakita ang mga bahagi ng isang bagay.",
        type: "say",
      },
      {
        text: "Ang bawat fraction ay may dalawang parts: ang numerator at ang denominator. Ang numerator ay nasa taas, at ito ang nagsasabi kung ilang bahagi ang kinuha natin.",
        type: "say",
      },
      {
        text: "Ang denominator naman ay nasa baba. Ito naman ang nagsasabi kung ilang equal parts ang hinati sa buong bagay.",
        type: "say",
      },
      {
        answer: "3",
        choices: ["8", "3", "11"],
        correctReply: "Tama! Ang numerator ay ang nasa taas, kaya 3 ang sagot.",
        question: "Sa fraction na 3/8, ano ang numerator?",
        questionType: "multiple_choice",
        type: "ask",
        wrongReply:
          "Hindi 'yan. Tandaan, ang numerator ay ang numero sa taas ng fraction. Subukan ulit!",
      },
      {
        answer: "8",
        choices: ["3", "11", "8"],
        correctReply: "Galing! Ang denominator ay ang numero sa baba. Ang 8 ang tamang sagot.",
        question: "Kung ang fraction ay 3/8, ano naman ang denominator?",
        questionType: "multiple_choice",
        type: "ask",
        wrongReply:
          "Mali. Ang denominator ay ang bilang ng lahat ng equal parts. Tingnan mabuti ang fraction.",
      },
      {
        text: "Ngayon, pag-usapan natin ang pag-add at pag-subtract ng fractions. Mas madali ito kapag pareho ang kanilang denominator. Ang tawag dito ay similar fractions.",
        type: "say",
      },
      {
        text: "Halimbawa, kung mayroon tayong 2/7 + 3/7, dahil pareho ang denominator na 7, ang gagawin lang natin ay i-add ang mga numerator. Kaya 2 + 3 = 5. Ang sagot ay 5/7.",
        type: "say",
      },
      {
        answer: "5/9",
        choices: ["5/9", "4/18", "1/3"],
        correctReply:
          "Wow, ang galing mo! Dahil pareho ang denominator na 9, in-add natin ang 4 at 1, kaya 5/9 ang sagot.",
        question: "Ano ang sagot sa 4/9 + 1/9?",
        questionType: "multiple_choice",
        type: "ask",
        wrongReply:
          "Medyo malapit na! Tandaan, kapag similar fractions, i-add lang ang numerators at hayaang pareho ang denominator.",
      },
      {
        text: "Ganun din sa subtraction. Halimbawa, 6/9 - 2/9. I-subtract lang natin ang mga numerator: 6 - 2 = 4. Ang sagot ay 4/9.",
        type: "say",
      },
      {
        text: "Paano naman kapag magkaiba ang denominator ng fractions? Ang tawag dito ay dissimilar fractions. Kailangan nating humanap ng common denominator.",
        type: "say",
      },
      {
        text: "Ang common denominator ay isang numero na pwedeng hatiin ng parehong denominators. Halimbawa, sa 1/2 + 1/4, ang common denominator ay 4.",
        type: "say",
      },
      {
        text: "Para magawa ito, kailangan nating gawing similar ang fractions. Gagawin nating 2/4 ang 1/2. Ngayon, pwede na nating i-add: 2/4 + 1/4 = 3/4.",
        type: "say",
      },
      {
        answer: "6",
        choices: ["3", "9", "6"],
        correctReply: "Tama! Ang 6 ay pwedeng hatiin ng 3 at ng 6. Mahusay!",
        question:
          "Alin sa mga sumusunod ang pinakamadaling common denominator para sa 1/3 at 1/6?",
        questionType: "multiple_choice",
        type: "ask",
        wrongReply:
          "Hindi 'yan. Ang common denominator ay dapat divisible ng parehong denominators. Try mo ulit isipin kung alin ang pinaka-angkop.",
      },
      {
        text: "Minsan, ang sagot natin ay kailangan pang i-simplify. Ibig sabihin, isulat ang fraction sa pinakasimpleng anyo nito. Halimbawa, ang 2/4 ay pwede pang i-simplify sa 1/2.",
        type: "say",
      },
      {
        text: "Ginagawa natin ito sa pamamagitan ng pag-divide ng numerator at denominator gamit ang parehong numero. Sa 2/4, pwede nating i-divide pareho sa 2, kaya magiging 1/2.",
        type: "say",
      },
      {
        answer: "1/2",
        choices: ["2/4", "1/2", "4/4"],
        correctReply:
          "Tamang-tama! Pwedeng i-divide ang 4 at 8 sa 4, kaya ang pinakasimpleng anyo ay 1/2.",
        question: "Paano natin masi-simplify ang fraction na 4/8?",
        questionType: "multiple_choice",
        type: "ask",
        wrongReply:
          "Halos tama! Ang 2/4 ay mas simple kaysa 4/8, pero ang 1/2 ay ang pinaka-simpleng anyo. Kailangan nating i-divide sa pinakamalaking numero na pwedeng paghati-an pareho.",
      },
      {
        text: "Ang fractions ay ginagamit natin araw-araw! Kapag naghahati tayo ng cake, nagmemesure ng ingredients sa pagluluto, o nagdi-divide ng mga gamit.",
        type: "say",
      },
      {
        text: "Halimbawa, kung kumain ka ng 1/4 ng pizza at ang kapatid mo ay kumain ng 2/4, ibig sabihin sabay kayong kumain ng 3/4 ng buong pizza.",
        type: "say",
      },
      {
        text: "Ang pagkakaintindi sa fractions, lalo na sa pag-add at pag-subtract, ay makakatulong sa inyo sa mga word problems at sa totoong buhay!",
        type: "say",
      },
    ],
    introMessage:
      "Hello, young learners! Wizard Tutor here! Ready for some magical math adventure today? Let's explore the world of fractions!",
    summary: [
      "Ang fractions ay nagpapakita ng mga bahagi ng isang buo.",
      "Ang numerator ay ang nasa taas, at ang denominator ay ang nasa baba.",
      "Ang similar fractions ay may parehong denominator, mas madaling i-add o i-subtract.",
      "Ang dissimilar fractions ay kailangan munang hanapan ng common denominator bago i-add o i-subtract.",
      "Ang pag-simplify ng fraction ay pagsulat nito sa pinakasimpleng anyo.",
    ],
  },
  aiStatus: "done",
  cleanedTextLength: 1940,
  createdAt: new Date("2026-05-24T10:12:28.000Z"),
  createdBy: "QiPRMfQHrjag8LcqPNr84cfRBFq2",
  displayTitle: "Fraction",
  gradeLevel: "5",
  isPublished: true,
  language: "taglish",
  originalTextLength: 1944,
  publishedAt: new Date("2026-05-24T10:13:19.000Z"),
  sourceFileName: "Fraction_add_subgrade-5.docx",
  sourceFilePath: "tempLessonFiles/1779617535494_Fraction_add_subgrade-5.docx",
  status: "published",
  subjectId: "QiPRMfQHrjag8LcqPNr84cfRBFq2_math_5",
  subjectName: "math",
  teacherValidation: {
    note: "",
    reviewedAt: new Date("2026-05-24T10:13:19.000Z"),
    reviewedBy: "QiPRMfQHrjag8LcqPNr84cfRBFq2",
    status: "published",
  },
  title: "Fraction",
  updatedAt: new Date("2026-05-24T10:13:19.000Z"),
  usedTextLength: 1940,
};
