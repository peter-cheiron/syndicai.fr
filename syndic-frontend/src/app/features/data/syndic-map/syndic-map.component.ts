import { AfterViewInit, Component, ElementRef, inject, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as d3 from "d3";
import { WaitService } from "src/app/ui/dialogs/wait-service/wait-service.component";

type ManagerType = "professionnel" 
  | "benevole" 
  | "unknown";

interface SyndicDirectoryEntry {
  syndicName?: string;
  buildingAddress?: string;
  buildings?: { buildingAddress?: string }[];
}

interface SyndicPoint {
  name: string;
  managerType?: ManagerType | string;
  mandateStatus?: string; // 👈 new
  address: string;
  postalCode?: string;
  city?: string;
  arrondissementCode?: string;
  arrondissementLabel?: string;
  lat: number;
  lng: number;
}

@Component({
  standalone: true,
  selector: "app-syndic-map",
  imports: [CommonModule],
  templateUrl: "./syndic-map.component.html",
})
export class SyndicMapComponent implements AfterViewInit {
  @ViewChild("svgEl", { static: true })
  svgRef!: ElementRef<SVGSVGElement>;

  points: SyndicPoint[] = [];
  visibleCount = 0;
  selectedPoint: SyndicPoint | null = null;
  syndicItems: string[] = [];
  addressItems: string[] = [];
  syndicQuery = "";
  addressQuery = "";

  // Filters for the sidebar
  typeFilterState: Record<ManagerType | "unknown", boolean> = {
    professionnel: true,
    benevole: true,
    unknown: true,
  };

  // 👇 Mandate type filters
  mandateStatus: string[] = [
    "Mandat expiré sans successeur déclaré",
    "Mandat en cours",
    "Pas de mandat en cours",
    "Mandat expiré avec successeur déclaré",
  ];

  mandateFilterState: Record<string, boolean> = {
    "Mandat expiré sans successeur déclaré": false,
    "Mandat en cours": false,
    "Pas de mandat en cours": false,
    "Mandat expiré avec successeur déclaré": false,
  };

  private readonly cachePrefix = "syndic-map-cache-v1";
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private projection!: d3.GeoProjection;
  private circles!: d3.Selection<
    SVGCircleElement,
    SyndicPoint,
    SVGGElement,
    unknown
  >;

  waitService = inject(WaitService)

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.waitService.show(
      "Veuillez patienter pendant le chargement...",
      "Il y a beaucoup de données, prenez une tasse de thé ou cafe."
    );
    this.svg = d3.select(this.svgRef.nativeElement);

    const width = this.svgRef.nativeElement.clientWidth || 800;
    const height = this.svgRef.nativeElement.clientHeight || 600;

    this.svg.attr("width", width).attr("height", height);

    this.projection = d3.geoMercator();
    const path = d3.geoPath().projection(this.projection);

    // Load GeoJSON + points
    Promise.all([
      this.fetchJsonWithCache(
        "/assets/paris/arrondissements.geojson",
        `${this.cachePrefix}-arrondissements`
      ),
      this.fetchJsonWithCache<SyndicPoint[]>(
        "/assets/paris/syndic-paris.json",
        `${this.cachePrefix}-syndic-points`
      ),
      this.fetchJsonWithCache<SyndicDirectoryEntry[]>(
        "/assets/paris/paris-syndic.json",
        `${this.cachePrefix}-directory`
      ),
    ])
      .then(([geoData, points, syndicDirectory]) => {
        if (!geoData || !points) return;

        this.prepareSearchItems(syndicDirectory || []);
        this.points = points;

        // Fit Paris into the SVG with padding
        this.projection.fitExtent(
          [
            [20, 20],
            [width - 20, height - 20],
          ],
          geoData as any
        );

        // Draw arrondissements
        this.svg
          .append("g")
          .selectAll("path")
          .data((geoData as any).features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "#ecfdf3")
          .attr("stroke", "#d1fae5")
          .attr("stroke-width", 0.7);

        // Draw points
        const gPoints = this.svg.append("g");

        this.circles = gPoints
          .selectAll("circle")
          .data(this.points)
          .enter()
          .append("circle")
          .attr("r", 4)
          .attr("cx", (d) => this.projection([d.lng, d.lat])![0])
          .attr("cy", (d) => this.projection([d.lng, d.lat])![1])
          .attr("fill", (d) => this.colorForType(d.managerType as ManagerType))
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.2)
          .style("cursor", "pointer")
          .on("click", (_, d) => this.onPointClick(d));

        this.applyFilters();
        this.waitService.hide()
      })
      .catch((err) => {
        console.error("Error loading map/points data", err);
      });
  }

  private colorForType(type?: ManagerType | string): string {
    const t = (type || "unknown") as ManagerType;
    if (t === "professionnel") return "#3b82f6"; // blue
    if (t === "benevole") return "#10b981"; // green
    return "#ee0e0eff"; // grey unknown
  }

  private fetchJsonWithCache<T>(
    url: string,
    cacheKey: string
  ): Promise<T | null> {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return Promise.resolve(JSON.parse(cached) as T);
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    return d3
      .json<T>(url)
      .then((data) => {
        if (!data) return null;
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {
          // If storage is unavailable or full, skip caching
        }
        return data;
      })
      .catch((err) => {
        console.error(`Failed to load ${url}`, err);
        return null;
      });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(type: "syndic" | "address", value: string): void {
    if (type === "syndic") {
      this.syndicQuery = value;
    } else {
      this.addressQuery = value;
    }
    this.applyFilters();
  }

  private prepareSearchItems(entries: SyndicDirectoryEntry[]): void {
    const syndicSet = new Set<string>();
    const addressSet = new Set<string>();

    for (const entry of entries || []) {
      if (entry.syndicName) {
        syndicSet.add(entry.syndicName.trim());
      }

      if (entry.buildingAddress) {
        addressSet.add(entry.buildingAddress.trim());
      }

      for (const building of entry.buildings || []) {
        if (building.buildingAddress) {
          addressSet.add(building.buildingAddress.trim());
        }
      }
    }

    this.syndicItems = Array.from(syndicSet).sort((a, b) =>
      a.localeCompare(b)
    );
    this.addressItems = Array.from(addressSet).sort((a, b) =>
      a.localeCompare(b)
    );
  }

  private applyFilters(): void {
    if (!this.circles) return;

    const activeManagerTypes = Object.entries(this.typeFilterState)
      .filter(([_, isOn]) => isOn)
      .map(([type]) => type as ManagerType);

    const activeMandates = Object.entries(this.mandateFilterState)
      .filter(([_, isOn]) => isOn)
      .map(([label]) => label);

    const syndicTerm = this.syndicQuery.trim().toLowerCase();
    const addressTerm = this.addressQuery.trim().toLowerCase();

    this.circles.style("display", (d) => {
      const mt = (d.managerType || "unknown") as ManagerType;
      const mandate = d.mandateStatus || "Mandat en cours";
      const name = (d.name || "").toLowerCase();
      const address = (d.address || "").toLowerCase();

      const managerOk = activeManagerTypes.includes(mt);
      const mandateOk = activeMandates.includes(mandate);
      const syndicOk = syndicTerm ? name.includes(syndicTerm) : true;
      const addressOk = addressTerm ? address.includes(addressTerm) : true;

      const shouldShow = (managerOk || mandateOk) && syndicOk && addressOk;

      return shouldShow ? null : "none";
    });

    this.updateVisibleCount();
  }

  private updateVisibleCount(): void {
    if (!this.circles) {
      this.visibleCount = 0;
      return;
    }
    let count = 0;
    this.circles.each(function () {
      const display = d3.select(this).style("display");
      if (display !== "none") count++;
    });
    this.visibleCount = count;
  }

  private onPointClick(d: SyndicPoint): void {
    this.selectedPoint = d;
  }
}
