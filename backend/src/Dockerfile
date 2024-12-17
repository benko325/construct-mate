FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
COPY data /app/data
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["ConstructMateBackend.csproj", "src/"]
RUN dotnet restore "src/ConstructMateBackend.csproj"
WORKDIR "/src/src"
COPY . .
RUN dotnet build "ConstructMateBackend.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "ConstructMateBackend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ConstructMateBackend.dll"]
