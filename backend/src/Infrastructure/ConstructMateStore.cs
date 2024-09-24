using Marten;

namespace ConstructMate.Infrastructure;

public class ConstructMateStore(StoreOptions options) : DocumentStore(options) { }
