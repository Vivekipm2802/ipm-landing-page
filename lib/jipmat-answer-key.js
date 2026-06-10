/**
 * JIPMAT 2026 — Official (Provisional) Answer Key
 *
 * Source: NTA Answer Key Challenge portal
 * (examinationservices.nic.in/ExamSys26Part2/KeyChallange/ChallangeAnswerKey.aspx)
 *
 * Keyed by **Question ID** (not question number). Question IDs are unique
 * across paper sets, so this works even if candidates received shuffled sets.
 *
 * Question ID ranges:
 *   QA   : 116313 – 116345 (33 Q)
 *   DILR : 116346 – 116378 (33 Q)
 *   VARC : 116379 – 116412 (34 Q)
 *
 * IMPORTANT: If NTA revises the key after challenges (final key), update the
 * affected entries here. If a question is dropped, set its value to "DROPPED"
 * — dropped questions are excluded from scoring (0 marks, not negative).
 */

export const JIPMAT_ANSWER_KEY_2026 = {
  // ── Quantitative Aptitude (Q1–33) ──
  116313: 4, 116314: 3, 116315: 1, 116316: 4, 116317: 1,
  116318: 2, 116319: 2, 116320: 3, 116321: 3, 116322: 3,
  116323: 4, 116324: 4, 116325: 1, 116326: 3, 116327: 3,
  116328: 4, 116329: 4, 116330: 4, 116331: 1, 116332: 3,
  116333: 2, 116334: 3, 116335: 1, 116336: 3, 116337: 3,
  116338: 4, 116339: 4, 116340: 2, 116341: 4, 116342: 3,
  116343: 3, 116344: 1, 116345: 4,

  // ── Data Interpretation & Logical Reasoning (Q34–66) ──
  116346: 4, 116347: 3, 116348: 3, 116349: 3, 116350: 2,
  116351: 4, 116352: 1, 116353: 4, 116354: 1, 116355: 1,
  116356: 2, 116357: 3, 116358: 3, 116359: 1, 116360: 1,
  116361: 3, 116362: 3, 116363: 3, 116364: 1, 116365: 2,
  116366: 4, 116367: 4, 116368: 2, 116369: 4, 116370: 3,
  116371: 2, 116372: 3, 116373: 4, 116374: 1, 116375: 2,
  116376: 4, 116377: 3, 116378: 1,

  // ── Verbal Ability & Reading Comprehension (Q67–100) ──
  116379: 3, 116380: 3, 116381: 1, 116382: 3, 116383: 4,
  116384: 2, 116385: 1, 116386: 4, 116387: 3, 116388: 4,
  116389: 4, 116390: 3, 116391: 1, 116392: 3, 116393: 4,
  116394: 2, 116395: 4, 116396: 1, 116397: 3, 116398: 2,
  116399: 2, 116400: 1, 116401: 4, 116402: 1, 116403: 4,
  116404: 2, 116405: 1, 116406: 4, 116407: 4, 116408: 2,
  116409: 1, 116410: 4, 116411: 4, 116412: 3,
};

/**
 * The first Question ID of the paper. Used as a fallback to derive a
 * Question ID from a global question number (1–100) for records parsed
 * before Question IDs were captured: ID = 116312 + questionNo.
 * Only valid for set01-ordered papers — prefer q.questionId when present.
 */
export const JIPMAT_2026_BASE_QUESTION_ID = 116312;

/**
 * Apply the answer key to an array of parsed questions (mutates in place).
 *
 * Each question: { questionNo, questionId?, chosenOption, status }
 * After applying: adds `correctAnswer` (string) and `isCorrect`
 * (true | false | null for unanswered, "dropped" for dropped questions).
 *
 * Returns the number of questions that were matched against the key.
 */
export function applyJipmatAnswerKey(questions) {
  if (!Array.isArray(questions)) return 0;
  let matched = 0;
  for (const q of questions) {
    let id = q.questionId ? parseInt(q.questionId, 10) : null;
    if (!id && q.questionNo) {
      // Legacy fallback for records stored without Question IDs (set01 order)
      id = JIPMAT_2026_BASE_QUESTION_ID + parseInt(q.questionNo, 10);
    }
    const correct = id ? JIPMAT_ANSWER_KEY_2026[id] : undefined;
    if (correct === undefined) continue;
    matched++;
    if (correct === "DROPPED") {
      q.correctAnswer = "DROPPED";
      q.isCorrect = "dropped";
      continue;
    }
    q.correctAnswer = String(correct);
    q.isCorrect =
      q.chosenOption && q.chosenOption !== ""
        ? String(q.chosenOption) === String(correct)
        : null;
  }
  return matched;
}
