using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.API.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        // Relationship: One User has Many Transactions
        // We will link this later to filter data by user!
        // public List<Transaction> Transactions { get; set; }
    }
}