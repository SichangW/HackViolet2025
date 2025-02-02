import pandas as pd
import re

class CrimeAnalysisSystem:
    def __init__(self):
        # Crime types we're looking for in the data
        self.crime_types = {
            "violent": [
                "MURDER", "RAPE", "ROBBERY", "FELONY ASSAULT"
            ],
            "non-violent": [
                "BURGLARY", "GRAND LARCENY", "GRAND LARCENY OF MOTOR VEHICLE"
            ]
        }
        
        # Load and prepare the data
        self.df = pd.read_csv('seven-major-felony-offenses-by-precinct-2000-2023(Sheet1).csv')
        self.years = range(2000, 2024)

    def extract_query_parameters(self, question):
        # Extract precincts (1-3 digits) and years (4 digits) from the question
        precincts = re.findall(r'\b\d{1,3}\b', question)
        years_mentioned = re.findall(r'\b\d{4}\b', question)  # Find years in 2000s
        if not precincts:
            precincts = ["1"]
        
        # If no specific years mentioned, use recent years for trend analysis
        if not years_mentioned:
            years_mentioned = [str(year) for year in range(2019, 2024)]
        
        crime_types = [
            'MURDER', 'RAPE', 'ROBBERY', 'FELONY ASSAULT',
            'BURGLARY', 'GRAND LARCENY', 'GRAND LARCENY OF MOTOR VEHICLE'
        ]
    
        # Create a regex pattern to match any of the crime types, case-insensitive
        crime_pattern = r'\b(?:' + '|'.join(crime_types) + r')\b'
    
        # Use re.findall with the IGNORECASE flag to find all crime types in the question
        crimes_mentioned = re.findall(crime_pattern, question, re.IGNORECASE)
    
        # If no specific crimes mentioned, include all
        if not crimes_mentioned:
            crimes_mentioned = crime_types
        #categorize crimes mentioned as violent and non-violent
        return {
            'precincts': precincts,
            'years': years_mentioned,
            'crimes': crimes_mentioned
        }
    
    def get_crime_data(self, params):
        results = []
        for precinct in params['precincts']:
            precinct_data = {}
            for year in params['years']:
                year_data = {
                    "violent": {},  # Changed to store individual crimes
                    "non-violent": {},  # Changed to store individual crimes
                    "total": 0
                }
                
                for crime in params['crimes']:
                    crime = crime.upper()  # Normalize to uppercase
                    try:
                        value = self.df[
                            (self.df['PCT'] == int(precinct)) & 
                            (self.df['CRIME'].str.contains(crime, case=False))
                        ][str(year)].iloc[0]
                        
                        # Store individual crime counts
                        if crime in self.crime_types["violent"]:
                            year_data["violent"][crime] = int(value)
                        elif crime in self.crime_types["non-violent"]:
                            year_data["non-violent"][crime] = int(value)
                        
                        # Update total crimes
                        year_data["total"] += int(value)
                    except:
                        if crime in self.crime_types["violent"]:
                            year_data["violent"][crime] = 0
                        elif crime in self.crime_types["non-violent"]:
                            year_data["non-violent"][crime] = 0
                        
                precinct_data[year] = year_data
            results.append({
                'precinct': precinct,
                'data': precinct_data
            })
        return results

    def analyze_trends(self, data):
        analysis = ""
        for precinct_data in data:
            precinct = precinct_data['precinct']
            
            years = sorted(precinct_data['data'].keys())
            first_year, latest_year = years[0], years[-1]
            
            # Start the analysis box
            analysis += f"<div class='analysisBox'><h2>Crime Data for Precinct {precinct}:</h2><ul>"
            
            for year in years:
                year_data = precinct_data['data'][year]
                analysis += f"<li><strong>In {year}:</strong><ul>"
                
                # Violent crimes section
                analysis += "<li><strong>Violent Crimes:</strong><ul>"
                violent_total = 0
                for crime, count in year_data["violent"].items():
                    analysis += f"<li>{crime}: {count}</li>"
                    violent_total += count
                analysis += f"<li><strong>Total Violent: {violent_total}</strong></li></ul>"
                
                # Non-violent crimes section
                analysis += "<li><strong>Non-Violent Crimes:</strong><ul>"
                non_violent_total = 0
                for crime, count in year_data["non-violent"].items():
                    analysis += f"<li>{crime}: {count}</li>"
                    non_violent_total += count
                analysis += f"<li><strong>Total Non-Violent: {non_violent_total}</strong></li></ul>"
                
                analysis += f"<li><strong>Total Crimes: {year_data['total']}</strong></li></ul></li>"
            
            # Calculate percent changes for two-year data
            if len(years) == 2:
                first_data = precinct_data['data'][first_year]
                latest_data = precinct_data['data'][latest_year]
                
                first_violent = sum(first_data["violent"].values())
                first_non_violent = sum(first_data["non-violent"].values())
                latest_violent = sum(latest_data["violent"].values())
                latest_non_violent = sum(latest_data["non-violent"].values())
                
                # Calculate percent changes
                violent_change = self.calculate_percent_change(first_violent, latest_violent)
                non_violent_change = self.calculate_percent_change(first_non_violent, latest_non_violent)
                total_change = self.calculate_percent_change(first_data["total"], latest_data["total"])
                
                analysis += f"<li><strong>Percent Changes from {first_year} to {latest_year}:</strong><ul>"
                analysis += f"<li>Violent Crimes: {violent_change:.2f}%</li>"
                analysis += f"<li>Non-Violent Crimes: {non_violent_change:.2f}%</li>"
                analysis += f"<li>Total Crimes: {total_change:.2f}%</li></ul>"
                
                # Safety level
                if total_change > 0:
                    safety = "gotten more dangerous"
                elif total_change < 0:
                    safety = "gotten relatively safe"
                else:
                    safety = "stayed the same"
                
                analysis += f"<li><strong>Analysis:</strong> Based on recent crime statistics, Precinct {precinct} has {safety}.</li>"
                analysis += f"<li><strong>Total crime changed by {total_change:.1f}%</strong> from {first_year} to {latest_year}.</li>"
                
            analysis += "</ul></div>"
        return analysis

    def calculate_percent_change(self, old_value, new_value):
        if old_value == 0 and new_value == 0:
            return 0
        if old_value == 0:
            return 100
        return ((new_value - old_value) / old_value) * 100

    def process_question(self, question):
        try:
            params = self.extract_query_parameters(question)
            crime_data = self.get_crime_data(params)
            analysis = self.analyze_trends(crime_data)
            
            return {
                'parameters': params,
                'data': crime_data,
                'analysis': analysis
            }
        except Exception as e:
            return f"Error processing question: {str(e)}"

def main():
    system = CrimeAnalysisSystem()
    question = input("Enter your question: ")
    result = system.process_question(question)
    print("\nAnalysis:", result['analysis'])

if __name__ == "__main__":
    main()