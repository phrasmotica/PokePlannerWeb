// JENKINS PARAMETERS
// - BRANCH_NAME: the branch to build

node {
    dir("PokeApiNet") {
        stage("Checkout PokeApiNet") {
            git(
                url: "https://github.com/phrasmotica/PokeApiNet",
                branch: "poke-planner-web"
            )
        }

        stage("Build PokeApiNet") {
            powershell "dotnet build"
        }

        stage("Run unit tests") {
            powershell "dotnet test --filter \"Category = Unit\""
        }

        stage("Run integration tests") {
            powershell "dotnet test --filter \"Category = Integration\""
        }
    }
    
    dir("PokePlannerWeb") {
        stage("Checkout PokePlannerWeb") {
            checkout scm
        }

        stage("Build PokePlannerWeb") {
            powershell "dotnet build"
        }
    }
}