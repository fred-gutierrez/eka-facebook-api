import { Interior, Post, Property } from "../../types/postTypes";
import ImageCarousel from "../Systems/ImageCarousel";

interface Props {
  postData: Post[];
}

const PostItem = ({ postData }: Props) => {
  return (
    <ul>
      {postData.map((post: Post, index: number) => {
        // * Price
        const priceMatch: RegExpMatchArray | null = post.message.match(
          /(\$|₡|¢)\d{1,4}(,\d{3})*(\.\d{3})*(\.\d+)?\s*(mil(?=[\s,]|$))?/g,
        );

        const price: string[] = priceMatch
          ? priceMatch.map((match) => {
              let cleanPrice = match.trim();
              if (
                cleanPrice.match(/mil(?=[\s,]|$)/) &&
                !cleanPrice.includes(".000")
              ) {
                cleanPrice = cleanPrice.replace(/\s?mil(?=[\s,]|$)\b/g, ".000");
              } else {
                cleanPrice = cleanPrice.replace(/\s?mil(?=[\s,]|$)\b/g, "");
              }
              return cleanPrice;
            })
          : [];

        let highestPrice: string = "";
        for (let i = 0; i < price.length; i++) {
          price[i].startsWith("$") && parseFloat(price[i].substring(1)) >= 450
            ? (highestPrice = price[i])
            : (highestPrice = price[i]);
        }

        // * Title
        const title = post.message.substring(0, post.message.indexOf("\n"));

        // * Location
        const location = post.message.match(/📍(.*?)\n/);
        const locationString = location !== null ? location[1] : "";

        // * Alquiler o Venta
        const alquilerVentaMatch = post.message.match(
          /(alquil[oó]|alquiler|vendo|venta)/i,
        );

        let alquilerVenta = null;

        if (alquilerVentaMatch) {
          const matchValue = alquilerVentaMatch[1].toLowerCase();
          switch (matchValue) {
            case "alquilo":
            case "alquiló":
            case "alquiler":
              alquilerVenta = "Alquiler";
              break;
            case "vendo":
            case "venta":
              alquilerVenta = "Venta";
              break;
          }
        }

        // * Baños and Habitaciones
        function parseSpanishNumber(numberString: string) {
          switch (numberString.toLowerCase()) {
            case "una":
              return 1;
            case "dos":
              return 2;
            case "tres":
              return 3;
            // Add more cases as needed for other Spanish numbers
            default:
              return parseInt(numberString);
          }
        }

        const habitacionMatch = post.message.match(
          /(\d+|\buna\b|\bdos\b|\btres\b)\s*(habitaci[oó]n|(?:es)|dormitorio)s?/i,
        );
        const banoMatch = post.message.match(
          /(\d+)\s*(?:batería(?:s)? de\s+)?baño(?:s)?/i,
        );

        const habitaciones = habitacionMatch
          ? parseSpanishNumber(habitacionMatch[1])
          : 0;
        const banos = banoMatch ? parseInt(banoMatch[1]) : 0;

        // * Metros cuadrados
        const metrosMatch = post.message.match(
          /(\d+(?:\.\d+)?)\s*(?=m²|M2|metros\s+cuadrados|mts|de terreno|de construcci[oó]n|terreno)/i,
        );
        const metros = metrosMatch ? parseFloat(metrosMatch[1]) : 0;

        // * Residencial|Lote|Bodega|Casa|Apartamento|Terreno
        const propertiesArray =
          post.message
            .match(
              /\b(residencial|lote|bodega|casa|apartamento|terreno|local)\b/gi,
            )
            ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1)) || [];
        const propertyType = [...new Set([propertiesArray[0]])];

        const interiorDetails: Interior[] = [
          {
            ifStatement: habitaciones,
            icon: "bed",
            desc: ` Dormitorio${habitaciones > 1 ? "s" : ""}`,
            display: habitaciones,
          },
          {
            ifStatement: banos,
            icon: "bath",
            desc: ` Baño${banos > 1 ? "s" : ""}`,
            display: banos,
          },
          {
            ifStatement: metros >= 45 ? metros : false,
            icon: "map",
            desc: "m²",
            display: metros,
          },
        ];

        const propertiesType: Property[] = [
          {
            propType: "Residencial",
            icon: "house-user",
          },
          {
            propType: "Terreno",
            icon: "mountain-sun",
          },
          { propType: "Lote", icon: "panorama" },
          {
            propType: "Casa",
            icon: "house-chimney",
          },
          {
            propType: "Apartamento",
            icon: "building-user",
          },
          {
            propType: "Local",
            icon: "shop",
          },
          {
            propType: "Bodega",
            icon: "warehouse",
          },
        ];

        return (
          <li
            key={index}
            id={post.id}
            className={`
            bg-gray-100 border-2 border-gray-200
            shadow-lg shadow-gray-200
            items-center
            mb-6 md:mb-6 py-8 md:py-6 px-5 mx-5
            max-w-screen-lg 
            md:grid md:grid-cols-2
            lg:mx-auto rounded-xl`}
          >
            <div>
              {post.attachments.data.map((attachment: any) => {
                const allImages = attachment.subattachments.data.map(
                  (subattachment: any) => subattachment.media.image.src,
                );

                return <ImageCarousel images={allImages} />;
              })}
            </div>
            <div className="md:pl-5">
              <div className="flex items-center pt-5 md:pt-0">
                <h1 className={`text-2xl sm:text-3xl font-bold`}>
                  {highestPrice}
                </h1>
                <p className={`ml-2 text-lg text-center font-light`}>
                  - En {alquilerVenta}
                </p>
              </div>
              <h1 className={`text-lg md:text-xl pt-2`}>{title}</h1>
              <div className="py-3">
                {interiorDetails.map((intDetails) =>
                  intDetails.ifStatement ? (
                    <div className="inline-flex items-center mr-3">
                      <i
                        className={`fa-light fa-${intDetails.icon} mr-1 text-gray-800`}
                      ></i>
                      <div>
                        <span className="font-semibold">
                          {intDetails.display}
                        </span>
                        {intDetails.desc}
                      </div>
                    </div>
                  ) : null,
                )}
                {propertiesType.map(
                  (property) =>
                    propertyType.includes(property.propType) && (
                      <div className="inline-flex items-center">
                        <i
                          className={`fa-light fa-${property.icon} text-gray-800 mr-1`}
                        ></i>
                        <span>{property.propType}</span>
                      </div>
                    ),
                )}
              </div>
              <div>
                {locationString && (
                  <div className="flex items-center pb-4">
                    <i
                      className={`fa-solid fa-location-dot mr-2 text-red-500`}
                    ></i>
                    <h1 className={`text-lg font-light`}>{locationString}</h1>
                  </div>
                )}
                <div className="w-full">
                  <a
                    href={`https://www.facebook.com/BienesRaicesEka/posts/${post.id}`}
                    target={"_blank"}
                  >
                    <button
                      className={`bg-orange-500 hover:bg-orange-400 text-white 
                font-bold py-2 px-4 border-b-4 border-orange-700 hover:border-orange-500 
                rounded  hover:animate-pulse w-full md:w-36`}
                    >
                      Ver Detalles
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default PostItem;
