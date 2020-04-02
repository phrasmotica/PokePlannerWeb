using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
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
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // bind database settings
            services.Configure<DataStoreSettings>(
                Configuration.GetSection(nameof(DataStoreSettings))
            );

            // create singleton for database settings
            services.AddSingleton<IDataStoreSettings>(sp =>
                sp.GetRequiredService<IOptions<DataStoreSettings>>().Value
            );

            services.AddSingleton<PokeApiClient>();
            services.AddSingleton<IPokeAPI, PokeAPI>();

            // create data store services
            var dataStoreSettings = Configuration.GetSection(nameof(DataStoreSettings)).Get<DataStoreSettings>();
            var dataStoreSourceFactory = new DataStoreSourceFactory(dataStoreSettings.ConnectionString, dataStoreSettings.DatabaseName);

            services.AddSingleton<EfficacyService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<EncountersEntry>(dataStoreSettings.EncounterCollectionName)
            );
            services.AddSingleton<EncountersService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<GenerationEntry>(dataStoreSettings.GenerationCollectionName)
            );
            services.AddSingleton<GenerationService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<LocationEntry>(dataStoreSettings.LocationCollectionName)
            );
            services.AddSingleton<LocationService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<LocationAreaEntry>(dataStoreSettings.LocationAreaCollectionName)
            );
            services.AddSingleton<LocationAreaService>();

            services.AddSingleton<MachineService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<PokedexEntry>(dataStoreSettings.PokedexCollectionName)
            );
            services.AddSingleton<PokedexService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<PokemonEntry>(dataStoreSettings.PokemonCollectionName)
            );
            services.AddSingleton<PokemonService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<PokemonFormEntry>(dataStoreSettings.PokemonFormCollectionName)
            );
            services.AddSingleton<PokemonFormService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<PokemonSpeciesEntry>(dataStoreSettings.PokemonSpeciesCollectionName)
            );
            services.AddSingleton<PokemonSpeciesService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<StatEntry>(dataStoreSettings.StatCollectionName)
            );
            services.AddSingleton<StatService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<TypeEntry>(dataStoreSettings.TypeCollectionName)
            );
            services.AddSingleton<TypeService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<VersionEntry>(dataStoreSettings.VersionCollectionName)
            );
            services.AddSingleton<VersionService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<VersionGroupEntry>(dataStoreSettings.VersionGroupCollectionName)
            );
            services.AddSingleton<VersionGroupService>();

            services.AddCors();

            services.AddControllersWithViews();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
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
