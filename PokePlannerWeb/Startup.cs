using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization.Conventions;
using PokeApiNet;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;
using PokemonEntry = PokePlannerWeb.Data.DataStore.Models.PokemonEntry;

namespace PokePlannerWeb
{
    public class Startup
    {
        /// <summary>
        /// Types whose fields should not be serialised if they have default values assigned.
        /// </summary>
        private static readonly System.Type[] IgnoreDefaultValuesTypes =
        {
            typeof(Generation),
            typeof(Pokedex),
            typeof(Pokemon),
            typeof(PokemonForm),
            typeof(Type),
            typeof(Version),
            typeof(VersionGroup)
        };

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // bind database settings
            services.Configure<PokePlannerWebDbSettings>(
                Configuration.GetSection(nameof(PokePlannerWebDbSettings))
            );

            // create singleton for database settings
            services.AddSingleton<IPokePlannerWebDbSettings>(sp =>
                sp.GetRequiredService<IOptions<PokePlannerWebDbSettings>>().Value
            );

            services.AddSingleton<PokeApiClient>();
            services.AddSingleton<IPokeAPI, PokeAPI>();

            // create DB services
            var dbSettings = Configuration.GetSection(nameof(PokePlannerWebDbSettings)).Get<PokePlannerWebDbSettings>();
            var cacheSourceFactory = new CacheSourceFactory(dbSettings.ConnectionString, dbSettings.DatabaseName);

            services.AddSingleton<EfficacyService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<EncountersEntry>(dbSettings.EncountersCollectionName)
            );
            services.AddSingleton<EncountersService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<GenerationEntry>(dbSettings.GenerationsCollectionName)
            );
            services.AddSingleton<GenerationsService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<LocationEntry>(dbSettings.LocationsCollectionName)
            );
            services.AddSingleton<LocationsService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<LocationAreaEntry>(dbSettings.LocationAreasCollectionName)
            );
            services.AddSingleton<LocationAreasService>();

            services.AddSingleton<MachinesService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<PokedexEntry>(dbSettings.PokedexesCollectionName)
            );
            services.AddSingleton<PokedexesService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<PokemonEntry>(dbSettings.PokemonCollectionName)
            );
            services.AddSingleton<PokemonService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<PokemonFormEntry>(dbSettings.PokemonFormsCollectionName)
            );
            services.AddSingleton<PokemonFormsService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<PokemonSpeciesEntry>(dbSettings.PokemonSpeciesCollectionName)
            );
            services.AddSingleton<PokemonSpeciesService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<StatEntry>(dbSettings.StatsCollectionName)
            );
            services.AddSingleton<StatsService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<TypeEntry>(dbSettings.TypesCollectionName)
            );
            services.AddSingleton<TypesService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<VersionEntry>(dbSettings.VersionsCollectionName)
            );
            services.AddSingleton<VersionsService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<VersionGroupEntry>(dbSettings.VersionGroupsCollectionName)
            );
            services.AddSingleton<VersionGroupsService>();

            services.AddCors();

            services.AddControllersWithViews();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });

            // ignore null values when writing to datastore
            ConventionRegistry.Register(
                "IgnoreIfDefault",
                new ConventionPack { new IgnoreIfDefaultConvention(true) },
                t => IgnoreDefaultValuesTypes.Contains(t)
            );
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production
                // scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            // Shows UseCors with CorsPolicyBuilder.
            app.UseCors(builder =>
            {
                builder.WithOrigins("http://localhost:3000")
                       .AllowAnyMethod()
                       .AllowCredentials();
            });

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:3000");
                }
            });
        }
    }
}
