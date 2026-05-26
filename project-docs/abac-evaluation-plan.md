# ABAC Policy Evaluation Implementation Plan

This document outlines the steps to implement the Policy Evaluation flow as illustrated in the project mockups.

## 1. Requirement Analysis
Based on the provided images, the evaluation context consists of:
- **Subject Attributes**: `role`, `department`, `clearance`, `mfa_verified`, `subscription`, `location`.
- **Resource Attributes**: `type`, `sensitivity`, `environment`, `owner_id`.
- **Action & Context**: `action`, `network`, `risk_score`.

## 2. Proposed Architecture

### Evaluation Engine
A dedicated engine to evaluate JSON-based conditions against a context object.
- **Location**: `src/modules/iam/domain/services/policy-evaluator.engine.ts`
- **Logic**: Support operators like `EQUALS`, `IN`, `GREATER_THAN`, etc., for ABAC conditions.

### Evaluation DTOs
Define the structure of the request and response for the evaluation API.
- **Request**: `EvaluatePolicyDto` containing subject, resource, action, and environment attributes.
- **Response**: `EvaluationResultDto` containing the decision (ALLOW/DENY), matching policies, and the context used.

### API Endpoint
A new controller endpoint to allow users (and the frontend) to test policy evaluation.
- **Route**: `POST /iam/policies/evaluate`

## 3. Step-by-Step Implementation

### Step 1: Define DTOs
Create `EvaluatePolicyDto` and related sub-interfaces in `src/modules/iam/application/dtos/queries/policy`.

### Step 2: Implement Evaluation Engine
- Create a service that takes a context and a policy condition.
- Implement recursive condition evaluation.
- Support attribute access via path (e.g., `subject.role`).

### Step 3: Policy Evaluation Service
- Fetch relevant policies based on action and resource.
- Iterate through policies and apply the Evaluation Engine.
- Handle `DENY` override logic (if any `DENY` matches, the final result is `DENY`).

### Step 4: Presentation Layer
- Create `PolicyEvaluationController`.
- Add Swagger documentation to match the UI fields.

### Step 5: Refactoring Recommendations

#### Backend (IAM Module)
- **Standardize Attribute Keys**: Move towards using `subject` instead of `user` in ABAC policies to align with standard ABAC terminology and the new UI.
- **Priority Support**: Add a `priority` field to the `Policy` model in Prisma to allow more granular control over which policy "wins" (e.g., P0, P50).
- **Metadata in Policies**: Add a `metadata` JSON field to policies to store UI-specific info like categories or labels.

#### Frontend (Policy Evaluator)
- **Dynamic Attribute Loading**: Instead of hardcoded dropdowns, fetch available attributes from the `GET /iam/attributes` API.
- **Context Construction**: Ensure the "Evaluate" button sends a nested object:
  ```json
  {
    "subject": { "role": "...", "department": "...", ... },
    "resource": { "type": "...", "sensitivity": "...", ... },
    "action": "...",
    "context": { "network": "...", "risk_score": ... }
  }
  ```
- **Result Visualization**:
  - Use the `decision` field to show ALLOW/DENY.
  - Iterate `evaluated_policies` to build the "EVALUATED POLICIES" list.
  - Match `status: "APPLIED"` to the primary matched policy (green checkmark).
  - Match `status: "MATCHED"` to other policies that would have matched but weren't the deciding factor.
