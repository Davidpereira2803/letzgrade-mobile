import json

def main():
    # Load the JSON file
    with open("d:/Projects/UniGrades/letzgrade-mobile/assets/catalog/classes.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Ask the user for the year
    year_input = input("Enter the year (e.g., 7C, 6CL, 5C, ...): ").strip()

    # Find the matching year in the JSON
    year_data = next((y for y in data["years"] if y["year"] == year_input), None)

    if year_data is None:
        print(f"Year '{year_input}' not found.")
        return

    # Compute the sum of coeffs
    total_coeff = sum(course["coeff"] for course in year_data["courses"])

    print(f"Total coeff for year {year_input}: {total_coeff}")

if __name__ == "__main__":
    main()
