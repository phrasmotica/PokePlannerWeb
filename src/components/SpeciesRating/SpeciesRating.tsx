import { Rating } from "@material-ui/lab"
import React, { useState } from "react"
import { TiHeartFullOutline, TiHeartOutline } from "react-icons/ti"
import { Button } from "reactstrap"

import { PokemonSpeciesInfo } from "../../models/swagger"

import { CssHelper } from "../../util/CssHelper"

interface SpeciesRatingProps {
    species: PokemonSpeciesInfo | undefined
}

type SpeciesRatingsDict = {
    id: number
    rating: number
}[]

export const SpeciesRating = (props: SpeciesRatingProps) => {
    const [speciesRatings, setSpeciesRatings] = useState<SpeciesRatingsDict>([])
    const [favouriteSpecies, setFavouriteSpecies] = useState<number[]>([])

    let species = props.species
    let speciesIsReady = species !== undefined
    let faveStyle = CssHelper.defaultCursorIf(!speciesIsReady)

    let isFavourite = species !== undefined && favouriteSpecies.includes(species?.pokemonSpeciesId)

    let faveTooltip = "Add Pokemon to favourites"
    let faveIcon = <TiHeartOutline className="selector-button-icon" />
    if (speciesIsReady && isFavourite) {
        faveTooltip = "Remove Pokemon from favourites"
        faveIcon = <TiHeartFullOutline className="selector-button-icon" />
    }

    /**
     * Returns the rating of the selected species.
     */
    const getSpeciesRating = () => {
        let speciesId = props.species?.pokemonSpeciesId
        if (speciesId === undefined) {
            return null
        }

        return speciesRatings.find(r => r.id === speciesId)?.rating ?? null
    }

    /**
     * Sets a new rating for the selected species.
     */
    const setSpeciesRating = (newRating: number | null) => {
        let speciesId = props.species?.pokemonSpeciesId
        if (speciesId === undefined) {
            return
        }

        let ratings = speciesRatings
        let current = ratings.findIndex(r => r.id === speciesId)

        // TODO: write to a real DB somewhere. This will require user auth first since we
        // need a unique token for each user

        if (current >= 0 && newRating === null) {
            // remove existing rating
            ratings.splice(current, 1)

            console.log(ratings)
            setSpeciesRatings(ratings)
        }
        else if (newRating !== null) {
            if (current >= 0) {
                // amend existing rating
                ratings[current].rating = newRating
            }
            else {
                // add new rating
                ratings.push({ id: speciesId, rating: newRating })
            }

            console.log(ratings)
            setSpeciesRatings(ratings)
        }
    }

    /**
     * Toggles the favourite status of the species with the given ID.
     */
    const toggleFavouriteSpecies = (pokemonSpeciesId: number | undefined) => {
        if (pokemonSpeciesId === undefined) {
            return
        }

        let i = favouriteSpecies.indexOf(pokemonSpeciesId)

        // TODO: write to a real DB somewhere. This will require user auth first since we
        // need a unique token for each user

        if (i < 0) {
            favouriteSpecies.push(pokemonSpeciesId)
        }
        else {
            favouriteSpecies.splice(i, 1)
        }

        setFavouriteSpecies(favouriteSpecies)
    }

    return (
        <div>
            <div className="flex-center margin-right-small">
                <Rating
                    size="large"
                    disabled={!speciesIsReady}
                    value={getSpeciesRating()}
                    onChange={(_, newRating) => setSpeciesRating(newRating)} />
            </div>

            <div className="flex-center margin-right-small">
                <Button
                    color="primary"
                    style={faveStyle}
                    className="selector-button"
                    disabled={!speciesIsReady}
                    onMouseUp={() => toggleFavouriteSpecies(species?.pokemonSpeciesId)}>
                    <span title={species?.pokemonSpeciesId ? faveTooltip : undefined}>
                        {faveIcon}
                    </span>
                </Button>
            </div>
        </div>
    )
}
