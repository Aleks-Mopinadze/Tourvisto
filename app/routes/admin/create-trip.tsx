import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns"
import { Header } from "../../../components"
import type { Route } from "./+types/create-trip";
import { comboBoxItems, selectItems } from "~/constants";
import { cn, formatDate, formatKey } from "~/lib/utils";
import { LayerDirective, LayersDirective, MapsComponent } from "@syncfusion/ej2-react-maps";
import { useState } from "react";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";

export const loader = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,latlng,maps');
    const data = await response.json();

    return data.map((country: any) => ({
        name: country.name.common,
        imageUrl: country.flags?.svg || country.flags?.png,
        coordinates: country.latlng,
        openStreetMap: country.maps?.openStreetMap
    }))

}

const CreateTrip = ({loaderData}: Route.ComponentProps) => {
    const countries = loaderData as Country[]

    const [formData, setFormData] = useState<TripFormData>({
        country: countries[0]?.name || '',
        travelStyle: '',
        interest: '',
        budget: '',
        duration: 0,
        groupType: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>)=> {
        event.preventDefault();
        setLoading(true);

        if(!formData.country || !formData.travelStyle || !formData.budget || !formData.interest || !formData.groupType){
            setError('Please provide values for all fields')
            setLoading(false)

            return;
        }

        if(formData.duration < 1 || formData.duration > 10){
            setError('Duration must be between 1 and 10 days')
            setLoading(false)
            return;
        }

        const user = await account.get();
        if(!user.$id){
            console.error('User not authinticated')
            setLoading(false)
            return;
        }

        try{
            const response = await fetch('/api/create-trip', {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify({
                        country: formData.country,
                        numberOfDays: formData.duration,
                        travelStyle: formData.travelStyle,
                        interests: formData.interest,
                        budget: formData.budget,
                        groupType: formData.groupType,
                        userId: user.$id
                })
            })

            const result = await response.json()
            
            if(result?.id) navigate(`/trips/${result.id}`)
            else{console.error('Failed to generate trip')}

        }catch(e){
            navigate('/trips')
            console.error('Error generating a trip', e)
        }finally{
            setLoading(false)
        }
    };

    const handleChange = (key: keyof TripFormData, value: string | number) => {
        setFormData({...formData, [key]: value})
    }
    
    const countryData = countries.map((country) => ({
        text: country.name,
        imageUrl: country.imageUrl,
    }))

    const mapData = [
        {
            country: formData.country,
            color: '#EA382E',
            coordinates: countries.find((c: Country) => c.name === formData.country)?.coordinates || [],

        }
    ]

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
        <Header title="Add a New Trip" description="View and Edit AI Generated Travel plans" />

        <section className="mt-2.5 wrapper-md">
            <form onSubmit={handleSubmit} className="trip-form">
                <div>
                    <label htmlFor="country">
                        Country
                    </label>
                    <ComboBoxComponent 
                        id="country"
                        dataSource={countryData}
                        fields={{text: 'text', value: 'text'}}
                        placeholder="Select a Country"
                        className="combo-box"
                        itemTemplate={(data: any) => (
                            <div className="flex items-center p-1"> 
                                <img src={data.imageUrl} alt={data.text} className="size-5!" />
                                <span>{data.text}</span>
                            </div>
                        )}
                        change={(e: {value: string | undefined}) => {
                            if(e.value){
                                handleChange('country', e.value)
                            }
                        }}
                        allowFiltering
                        filtering={(e) => {
                            const query = e.text.toLowerCase();

                            e.updateData(
                                countries.filter((country) => country?.name.toLowerCase().includes(query)).map((country) => ({text: country.name, imageUrl: country.imageUrl}))
                            )
                           
                        }}
                    />

                    
                </div>


                <div>
                    <label htmlFor="duration">Duration</label>
                    <input type="text" 
                        id='duration'
                        name='duration'
                        placeholder="Enter a number of days (5, 12 ..."
                        className="form-input placeholder:text-gray-100"
                        onChange={(e) => handleChange('duration', Number(e.target.value))}
                    />
                </div>
                
                {
                    selectItems.map((key) => (
                        <div key={key}>
                            <label htmlFor={key}>{formatKey(key)}</label>

                            <ComboBoxComponent
                                id={key}
                                dataSource={comboBoxItems[key].map(item => ({text: item, value: item}))}
                                placeholder={`Select ${formatKey(key)}`}
                                change={(e: {value: string | undefined}) => {
                                    if(e.value){
                                        handleChange(key, e.value)
                                    }
                                }}
                                allowFiltering
                                filtering={(e) => {
                                    const query = e.text.toLowerCase();

                                    e.updateData(
                                    comboBoxItems[key].filter((item) => item.toLowerCase().includes(query)).map((item) => ({text: item, imageUrl: item}))
                            )
                           
                            }}
                            className="combo-box"
                            />
                        </div>
                    ))
                }

                <div>
                    <label htmlFor="location">Location on the world map</label>
                    <MapsComponent>
                        <LayersDirective>
                            <LayerDirective
                                shapeData={world_map}
                                dataSource={mapData}
                                shapePropertyPath='name'
                                shapeDataPath="country"
                                shapeSettings={{colorValuePath: 'color', fill: '#e5e5e5'}}
                                
                            />
                        </LayersDirective>
                    </MapsComponent>
                </div>

                <div className="bg-gray-200 h-px w-full"/>

                {error && (
                    <div className="error">
                        <p>{error}</p>
                    </div>
                )}

                <footer className="px-6 w-full">
                    <ButtonComponent type='submit'
                        className="button-class h-12! w-full!"
                        disabled={loading}
                    >
                        <img src={`/assets/icons/${loading ? 'loader.svg' : 'magic-star.svg'}`} alt="icnon" className={cn('size-5', {'animate-spin': loading  })} />
                        <span className="p-16-semibold text-white">
                            {
                                loading ? 'Generating...' : 'Generate Trip'
                            }
                        </span>
                    </ButtonComponent>
                </footer>
            </form>
        </section>
    </main>
  )
}

export default CreateTrip
