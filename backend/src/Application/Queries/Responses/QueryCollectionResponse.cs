namespace ConstructMate.Application.Queries.Responses;

/// <summary>
/// Temporary fix for query responses with collection to avoid Wolverine warnings
/// </summary>
/// <typeparam name="T">Type of items in the collection</typeparam>
/// <param name="QueryResponseItems">Collection items wrapped in the record</param>
public record QueryCollectionResponse<T>(IEnumerable<T> QueryResponseItems);