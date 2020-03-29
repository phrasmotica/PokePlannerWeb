using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization.Conventions;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb
{
    public class Startup
    {
        /// <summary>
        /// Types whose fields should not be serialised if they have default values assigned.
        /// </summary>
        private static readonly System.Type[] IgnoreDefaultValuesTypes =
        {
            typeof(PokeApiNet.PokemonForm),
            typeof(PokeApiNet.Pokemon),
            typeof(PokeApiNet.Generation),
            typeof(PokeApiNet.Type),
            typeof(PokeApiNet.VersionGroup)
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

            services.AddSingleton<IPokeAPI, PokeAPI>();

            services.AddSingleton<EfficacyService>();
            services.AddSingleton<EncountersService>();
            services.AddSingleton<GenerationsService>();
            services.AddSingleton<MachinesService>();
            services.AddSingleton<PokedexesService>();
            services.AddSingleton<PokemonService>();
            services.AddSingleton<PokemonFormsService>();
            services.AddSingleton<PokemonSpeciesService>();
            services.AddSingleton<StatsService>();
            services.AddSingleton<TypesService>();
            services.AddSingleton<VersionsService>();
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
