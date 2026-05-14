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
    Submitted,
    UnderReview,
    Accepted,
    Rejected
}

public enum EvaluationDecision
{
    Accepted,
    Rejected
}
