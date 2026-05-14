namespace InnovatEpam.Api.Models;

public enum Role
{
    Submitter,
    AdminEvaluator
}

public enum IdeaCategory
{
    Technology,
    Process,
    Product,
    People,
    Other
}

public enum IdeaStatus
{
    Draft,
    Submitted,
    InitialReview,
    TechnicalReview,
    FinalReview,
    Accepted,
    Rejected,
    // Legacy — kept for backward compatibility with existing data
    UnderReview
}

public enum EvaluationDecision
{
    Accepted,
    Rejected
}
