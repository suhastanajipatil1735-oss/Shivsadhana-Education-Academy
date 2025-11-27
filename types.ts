export interface Student {
  id: string;
  name: string;
  classGrade: string; // "5th" to "10th"
  totalFees: number;
  paidFees: number;
  dueFees: number;
}

export enum Screen {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ADD_STUDENT = 'ADD_STUDENT',
  FEES_REMINDER = 'FEES_REMINDER',
  VIEW_STUDENTS = 'VIEW_STUDENTS',
  REMOVE_STUDENTS = 'REMOVE_STUDENTS',
}

export const CLASS_OPTIONS = ["5th", "6th", "7th", "8th", "9th", "10th"];

export const STORAGE_KEY = "shivsadhana_students";
export const CORRECT_PASSWORD = "suhaspatilsir";
export const WHATSAPP_NUMBER = "919834252755";