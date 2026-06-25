"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface OrderWizardProps {
  steps: Step[];
  currentStep: number;
  children: React.ReactNode;
}

export function OrderWizard({ steps, currentStep, children }: OrderWizardProps) {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${step.id < currentStep
                      ? "bg-blue-600 text-white"
                      : step.id === currentStep
                        ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                    }
                  `}
                >
                  {step.id < currentStep ? <Check size={18} /> : step.id}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${
                  step.id <= currentStep ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 rounded transition-colors duration-300 ${
                  step.id < currentStep ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
