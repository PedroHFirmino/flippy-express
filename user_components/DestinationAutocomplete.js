import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { GOOGLE_MAPS_APIKEY } from "@env";

const DestinationAutocomplete = ({ onDestinationSelect }) => {
    const [searchText, setSearchText] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText.length >= 2) {
                fetchPredictions();
            } else {
                setPredictions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    const fetchPredictions = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
                `input=${encodeURIComponent(searchText)}` +
                `&components=country:br` +
                `&language=pt-BR` +
                `&key=${GOOGLE_MAPS_APIKEY}`
            );

            const result = await response.json();

            if (result.status === 'OK') {
                setPredictions(result.predictions);
            } else {
                setError('Não foi possível carregar as sugestões');
                setPredictions([]);
            }
        } catch (err) {
            setError('Erro ao buscar localizações');
            setPredictions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectDestination = async (prediction) => {
        try {
            setIsLoading(true);
            setError(null);

            // Buscar detalhes do local selecionado
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?` +
                `place_id=${prediction.place_id}` +
                `&fields=geometry` +
                `&key=${GOOGLE_MAPS_APIKEY}`
            );

            const result = await response.json();

            if (result.status === 'OK') {
                onDestinationSelect({
                    location: result.result.geometry.location,
                    description: prediction.description
                });
                setSearchText(prediction.description);
                setPredictions([]);
            } else {
                setError('Não foi possível obter os detalhes da localização');
            }
        } catch (err) {
            setError('Erro ao selecionar localização');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o endereço de destino"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {isLoading && (
                    <ActivityIndicator 
                        style={styles.loadingIndicator} 
                        color="#00b5f8"
                    />
                )}
            </View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {predictions.length > 0 && (
                <View style={styles.predictionsContainer}>
                    {predictions.map((prediction) => (
                        <TouchableOpacity
                            key={prediction.place_id}
                            style={styles.predictionItem}
                            onPress={() => handleSelectDestination(prediction)}
                        >
                            <Text style={styles.predictionText}>
                                {prediction.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 5,
        fontSize: 18,
    },
    loadingIndicator: {
        position: 'absolute',
        right: 12,
    },
    predictionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 5,
        marginTop: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    predictionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    predictionText: {
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginTop: 5,
        fontSize: 14,
    }
});

export default DestinationAutocomplete; 